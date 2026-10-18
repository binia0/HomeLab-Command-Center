import json, os, secrets, sqlite3, hashlib, hmac, time, threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from http.cookies import SimpleCookie
from urllib.parse import urlparse
from pathlib import Path

DB=Path(os.getenv('HCC_DB','/data/hcc.sqlite3')); DB.parent.mkdir(parents=True,exist_ok=True)
LOCK=threading.RLock()
def connect():
 c=sqlite3.connect(DB,timeout=20); c.row_factory=sqlite3.Row
 c.execute('PRAGMA journal_mode=WAL')
 c.executescript('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, secret TEXT NOT NULL);CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS builds(id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL);')
 return c
with connect() as c: pass
def hash_pass(password,salt):return hashlib.scrypt(password.encode(),salt=bytes.fromhex(salt),n=16384,r=8,p=1,dklen=32).hex()
def issue_token():return secrets.token_urlsafe(40)
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def send(self,status,payload):
  body=json.dumps(payload,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def read_body(self):
  try:
   n=int(self.headers.get('Content-Length','0'))
   if n<1 or n>2_000_000:raise ValueError('Invalid request size')
   data=json.loads(self.rfile.read(n))
   if not isinstance(data,dict):raise ValueError('Object required')
   return data
  except Exception as e:raise ValueError('Ungültige Daten') from e
 def csrf_ok(self):
  origin=self.headers.get('Origin',''); host=self.headers.get('Host','')
  if origin:
   p=urlparse(origin)
   return p.netloc==host and p.scheme in ('http','https')
  return True
 def current(self,c):
  jar=SimpleCookie()
  try:jar.load(self.headers.get('Cookie',''))
  except Exception:return None
  item=jar.get('rack_session')
  if not item:return None
  token=hashlib.sha256(item.value.encode()).hexdigest()
  return c.execute('SELECT users.id,users.username FROM users JOIN sessions ON users.id=sessions.user_id WHERE token_hash=? AND expires>?',(token,int(time.time()))).fetchone()
 def handle_request(self,method):
  path=urlparse(self.path).path
  if not path.startswith('/api/'):return self.send(404,{'error':'Not found'})
  if method!='GET' and not self.csrf_ok():return self.send(403,{'error':'Origin verification failed'})
  try:data=self.read_body() if method in ('POST','PUT') else {}
  except ValueError as e:return self.send(400,{'error':str(e)})
  try:
   with LOCK,connect() as c:
    if path in ('/api/register','/api/login') and method=='POST':
     user=str(data.get('username','')).strip().lower();pw=str(data.get('password',''))
     if len(user)<3 or len(user)>40 or not all(ch.isalnum() or ch in '_-' for ch in user) or len(pw)<12 or len(pw)>256:return self.send(400,{'error':'Benutzername 3–40 Zeichen, Passwort mindestens 12 Zeichen'})
     if path=='/api/register':
      salt=secrets.token_hex(16)
      try:
       result=c.execute('INSERT INTO users(username,salt,secret) VALUES(?,?,?)',(user,salt,hash_pass(pw,salt)));uid=result.lastrowid
      except sqlite3.IntegrityError:return self.send(409,{'error':'Benutzername bereits vergeben'})
     else:
      record=c.execute('SELECT * FROM users WHERE username=?',(user,)).fetchone()
      if not record or not hmac.compare_digest(record['secret'],hash_pass(pw,record['salt'])):return self.send(401,{'error':'Zugangsdaten ungültig'})
      uid=record['id']
     token=issue_token();c.execute('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),uid,int(time.time())+86400*14))
     self.send_response(200);body=json.dumps({'username':user},ensure_ascii=False).encode();self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Set-Cookie','rack_session='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=1209600');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
    if path=='/api/select-user' and method=='POST':
     user=str(data.get('username','')).strip().lower()
     if len(user)<2 or len(user)>40 or not all(ch.isalnum() or ch in '_-' for ch in user):return self.send(400,{'error':'Benutzername: 2–40 Buchstaben, Zahlen, _ oder -'})
     record=c.execute('SELECT id FROM users WHERE username=?',(user,)).fetchone()
     if record:uid=record['id']
     else:
      salt=secrets.token_hex(16)
      uid=c.execute('INSERT INTO users(username,salt,secret) VALUES(?,?,?)',(user,salt,'username-only')).lastrowid
     token=issue_token()
     c.execute('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),uid,int(time.time())+86400*14))
     body=json.dumps({'username':user},ensure_ascii=False).encode()
     self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Set-Cookie','rack_session='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=1209600');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
    current=self.current(c)
    if path=='/api/me' and method=='GET':return self.send(200,{'username':current['username'] if current else None})
    if not current:return self.send(401,{'error':'Bitte anmelden'})
    if path=='/api/logout' and method=='POST':
     jar=SimpleCookie();jar.load(self.headers.get('Cookie',''));token=jar.get('rack_session')
     if token:c.execute('DELETE FROM sessions WHERE token_hash=?',(hashlib.sha256(token.value.encode()).hexdigest(),))
     self.send_response(200);self.send_header('Set-Cookie','rack_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');self.send_header('Content-Length','2');self.end_headers();self.wfile.write(b'{}');return
    if path=='/api/builds' and method=='GET':
     rows=c.execute('SELECT id,name,updated FROM builds WHERE user_id=? ORDER BY updated DESC',(current['id'],)).fetchall()
     return self.send(200,{'builds':[dict(v) for v in rows]})
    if path=='/api/builds' and method=='POST':
     name=str(data.get('name','')).strip()[:100];payload=data.get('data')
     if not name or not isinstance(payload,dict):return self.send(400,{'error':'Rackname und Rackdaten erforderlich'})
     record_id=secrets.token_hex(16);c.execute('INSERT INTO builds(id,user_id,name,data,updated) VALUES(?,?,?,?,?)',(record_id,current['id'],name,json.dumps(payload),int(time.time())))
     return self.send(201,{'id':record_id})
    if path.startswith('/api/builds/'):
     bid=path.split('/')[-1];row=c.execute('SELECT * FROM builds WHERE id=? AND user_id=?',(bid,current['id'])).fetchone()
     if not row:return self.send(404,{'error':'Rack nicht gefunden'})
     if method=='GET':return self.send(200,{'id':bid,'name':row['name'],'data':json.loads(row['data'])})
     if method=='PUT':
      payload=data.get('data');name=str(data.get('name',row['name'])).strip()[:100]
      if not name or not isinstance(payload,dict):return self.send(400,{'error':'Ungültige Rackdaten'})
      c.execute('UPDATE builds SET name=?,data=?,updated=? WHERE id=? AND user_id=?',(name,json.dumps(payload),int(time.time()),bid,current['id']))
      return self.send(200,{'id':bid})
     if method=='DELETE':
      c.execute('DELETE FROM builds WHERE id=? AND user_id=?',(bid,current['id']))
      return self.send(200,{'deleted':True})
    return self.send(404,{'error':'Not found'})
  except Exception:
   return self.send(500,{'error':'Serverfehler'})
 def do_GET(self):self.handle_request('GET')
 def do_POST(self):self.handle_request('POST')
 def do_PUT(self):self.handle_request('PUT')
 def do_DELETE(self):self.handle_request('DELETE')
ThreadingHTTPServer(('0.0.0.0',8000),Handler).serve_forever()
