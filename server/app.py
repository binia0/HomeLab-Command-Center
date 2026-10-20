import json, os, secrets, sqlite3, hashlib, hmac, time, threading, struct
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from http.cookies import SimpleCookie
from urllib.parse import urlparse
from rack_validation import valid_rack_document
from model_conversion import stl_to_glb,step_to_glb
from pathlib import Path
from urllib.request import build_opener, HTTPRedirectHandler
from urllib.parse import urlencode, parse_qs

DB=Path(os.getenv('HCC_DB','/data/hcc.sqlite3')); DB.parent.mkdir(parents=True,exist_ok=True)
LOCK=threading.RLock()
def connect():
 c=sqlite3.connect(DB,timeout=20); c.row_factory=sqlite3.Row
 c.execute('PRAGMA journal_mode=WAL')
 c.executescript('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, secret TEXT NOT NULL);CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS builds(id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS build_revisions(id INTEGER PRIMARY KEY AUTOINCREMENT, build_id TEXT NOT NULL, user_id INTEGER NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, saved_at INTEGER NOT NULL);CREATE INDEX IF NOT EXISTS idx_build_revisions ON build_revisions(build_id,user_id,id DESC);CREATE TABLE IF NOT EXISTS model_assets(user_id INTEGER NOT NULL, device_id TEXT NOT NULL, glb BLOB NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(user_id,device_id));CREATE TABLE IF NOT EXISTS cad_library(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL,name TEXT NOT NULL,format TEXT NOT NULL,glb BLOB NOT NULL,updated INTEGER NOT NULL);')
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
  try:data=self.read_body() if method in ('POST','PUT') and not path.startswith('/api/models/') else {}
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
     if record:
      if c.execute('SELECT secret FROM users WHERE id=?',(record['id'],)).fetchone()['secret']!='username-only':return self.send(403,{'error':'Dieses Profil ist passwortgeschützt. Bitte anmelden.'})
      uid=record['id']
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
    if path=='/api/set-password' and method=='POST':
     pw=str(data.get('password',''))
     if not 12<=len(pw)<=256:return self.send(400,{'error':'Passwort muss zwischen 12 und 256 Zeichen lang sein'})
     salt=secrets.token_hex(16)
     c.execute('UPDATE users SET salt=?,secret=? WHERE id=?',(salt,hash_pass(pw,salt),current['id']))
     # Keep only this session after converting a legacy profile to a secured account.
     cookie=SimpleCookie()
     try:cookie.load(self.headers.get('Cookie',''))
     except Exception:pass
     session=cookie.get('rack_session')
     token_hash=hashlib.sha256(session.value.encode()).hexdigest() if session else ''
     c.execute('DELETE FROM sessions WHERE user_id=? AND token_hash!=?',(current['id'],token_hash))
     return self.send(200,{'secured':True})
    if path=='/api/logout' and method=='POST':
     jar=SimpleCookie();jar.load(self.headers.get('Cookie',''));token=jar.get('rack_session')
     if token:c.execute('DELETE FROM sessions WHERE token_hash=?',(hashlib.sha256(token.value.encode()).hexdigest(),))
     self.send_response(200);self.send_header('Set-Cookie','rack_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');self.send_header('Content-Length','2');self.end_headers();self.wfile.write(b'{}');return
    if path=='/api/telemetry' and method=='GET':
     # Only administrator-configured targets can be contacted. Never proxy arbitrary URLs.
     host=parse_qs(urlparse(self.path).query).get('host',[''])[0]
     try:sources=json.loads(os.getenv('HCC_NETDATA_SOURCES','{}'))
     except (ValueError,TypeError):sources={}
     if not isinstance(sources,dict) or host not in sources or not isinstance(sources[host],str):
      return self.send(404,{'error':'Keine Netdata-Quelle für dieses Gerät konfiguriert'})
     base=sources[host].rstrip('/')
     parsed=urlparse(base)
     if parsed.scheme!='http' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('','/'):
      return self.send(400,{'error':'Ungültige Netdata-Quellkonfiguration'})
     def chart(name):
      url=base+'/api/v1/data?'+urlencode({'chart':name,'after':-15,'points':1,'format':'json'})
      with build_opener(type('NoRedirect',(HTTPRedirectHandler,),{'redirect_request':lambda self,*args:None})()).open(url,timeout=2) as response:
       if response.status!=200:return None
       result=json.loads(response.read(120000))
      labels=result.get('labels',[])
      rows=result.get('data',[])
      if not rows or not labels:return None
      return {str(label):value for label,value in zip(labels[1:],rows[0][1:]) if isinstance(value,(int,float))}
     readings={}
     for metric,chart_name in (('cpu','system.cpu'),('ram','system.ram'),('network','system.net'),('uptime','system.uptime')):
      try:readings[metric]=chart(chart_name)
      except Exception:readings[metric]=None
     cpu=readings['cpu'];ram=readings['ram'];net=readings['network'];uptime=readings['uptime']
     cpu_percent=round(sum(v for k,v in cpu.items() if k!='idle'),1) if cpu else None
     ram_total=sum(v for k,v in ram.items() if k in ('used','free','cached','buffers')) if ram else 0
     ram_used=round(100*ram['used']/ram_total,1) if ram and 'used' in ram and ram_total>0 else None
     network_kbps=round(sum(abs(v) for v in net.values()),1) if net else None
     uptime_seconds=round(max(uptime.values())) if uptime else None
     return self.send(200,{'source':'Netdata','available':any(v is not None for v in readings.values()),'cpu_percent':cpu_percent,'ram_percent':ram_used,'network_kbps':network_kbps,'uptime_seconds':uptime_seconds,'timestamp':int(time.time())})
    if path.startswith('/api/library/import-reference/') and method=='POST':
     # Curated CC0 STEP reconstructions; generic equipment, never vendor originals.
     catalog={
      'switch-1u':('network-switch-1u-original-mep-cad-7fe1cf16','1U Netzwerk-Switch – generisches CAD (CC0)'),
      'server-2u':('server-2u-original-mep-cad-d3cafe00','2U Rackserver – generisches CAD (CC0)'),
      'ups-3u':('rack-ups-original-mep-cad-6727e424','3U Rack-USV – generisches CAD (CC0)'),
      'patch-24':('patch-panel-24-port-original-mep-cad-1b50ee3b','24-Port Patchpanel – generisches CAD (CC0)'),
      'cables':('cable-management-original-mep-cad-3f761529','2U Kabelmanagement – generisches CAD (CC0)')}
     key=path.split('/')[-1]
     if key not in catalog:return self.send(404,{'error':'Unbekanntes CAD-Modell'})
     from urllib.request import urlopen
     slug,name=catalog[key]
     existing=c.execute('SELECT id,length(glb) size FROM cad_library WHERE user_id=? AND name=? ORDER BY updated DESC LIMIT 1',(current['id'],name)).fetchone()
     if existing:return self.send(200,{'id':existing['id'],'name':name,'format':'step','size':existing['size'],'reused':True})
     url='https://www.innerscene.com/api/library/'+slug+'/download'
     try:
      with urlopen(url,timeout=30) as source:
       if source.geturl().split('/')[2] not in ('www.innerscene.com','innerscene.com'):raise ValueError('Nicht zugelassener CAD-Host')
       raw=source.read(12*1024*1024+1)
      if len(raw)>12*1024*1024 or b'ISO-10303-21' not in raw[:256]:raise ValueError('Die Quelle hat keine STEP-Datei geliefert')
      # CAD meshing can take a minute: keep other API requests responsive.
      LOCK.release()
      try:glb=step_to_glb(raw)
      finally:LOCK.acquire()
      if len(glb)>50*1024*1024:raise ValueError('Konvertiertes Modell zu groß')
     except Exception as error:return self.send(422,{'error':'CAD-Modell nicht importierbar: '+str(error)[:250]})
     new_id=secrets.token_hex(12)
     c.execute('INSERT INTO cad_library(id,user_id,name,format,glb,updated) VALUES(?,?,?,?,?,?)',(new_id,current['id'],name,'step',glb,int(time.time())))
     return self.send(201,{'id':new_id,'name':name,'format':'step','size':len(glb),'source':url,'license':'CC0'})
    if path=='/api/library/import-raspberry-pi-4' and method=='POST':
     # CC0 CAD reconstruction by Innerscene; not an official manufacturer STEP.
     old_name='Raspberry Pi 4 Model B – CAD-Rekonstruktion (CC0)'
     cached=c.execute('SELECT id,length(glb) size FROM cad_library WHERE user_id=? AND name=? ORDER BY updated DESC LIMIT 1',(current['id'],old_name)).fetchone()
     if cached:return self.send(200,{'id':cached['id'],'name':old_name,'format':'step','size':cached['size'],'reused':True})
     from urllib.request import urlopen
     url='https://www.innerscene.com/api/library/raspberry-pi-4-model-b-layout-821bd96d/download'
     try:
      with urlopen(url,timeout=30) as source:
       if source.geturl().split('/')[2] not in ('www.innerscene.com','innerscene.com'):raise ValueError('Unbekannter Downloadserver')
       raw=source.read(12*1024*1024+1)
      if len(raw)>12*1024*1024 or b'ISO-10303-21' not in raw[:256]:raise ValueError('Keine gültige STEP-Datei')
      # CAD meshing can take a minute: keep other API requests responsive.
      LOCK.release()
      try:glb=step_to_glb(raw)
      finally:LOCK.acquire()
      if len(glb)>50*1024*1024:raise ValueError('CAD-Konvertierung zu groß')
     except Exception as error:return self.send(422,{'error':'Raspberry Pi 4 STEP-Import fehlgeschlagen: '+str(error)[:250]})
     key=secrets.token_hex(12)
     name='Raspberry Pi 4 Model B – CAD-Rekonstruktion (CC0)'
     c.execute('INSERT INTO cad_library(id,user_id,name,format,glb,updated) VALUES(?,?,?,?,?,?)',(key,current['id'],name,'step',glb,int(time.time())))
     return self.send(201,{'id':key,'name':name,'format':'step','size':len(glb),'source':url,'license':'CC0'})
    if path=='/api/library/import-raspberry-pi-5' and method=='POST':
     # Official Raspberry Pi Ltd CAD model. Fetch only this fixed HTTPS URL.
     old_name='Raspberry Pi 5 – offizielles STEP-CAD'
     cached=c.execute('SELECT id,length(glb) size FROM cad_library WHERE user_id=? AND name=? ORDER BY updated DESC LIMIT 1',(current['id'],old_name)).fetchone()
     if cached:return self.send(200,{'id':cached['id'],'name':old_name,'format':'step','size':cached['size'],'reused':True})
     from urllib.request import urlopen
     from zipfile import ZipFile
     from io import BytesIO
     url='https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010082-CA-1-rpi-5%203D%20STEP%20-%20With%20Graphics%20large%20file.zip'
     try:
      with urlopen(url,timeout=30) as source:archive=source.read(35*1024*1024+1)
      if len(archive)>35*1024*1024:raise ValueError('Originaldatei zu groß')
      with ZipFile(BytesIO(archive)) as z:
       candidates=[info for info in z.infolist() if info.filename.lower().endswith(('.step','.stp')) and not info.is_dir()]
       if not candidates:raise ValueError('ZIP enthält keine STEP-Geometrie')
       part=max(candidates,key=lambda info:info.file_size)
       if part.file_size>50*1024*1024:raise ValueError('STEP-Datei ist zu groß')
       raw=z.read(part)
      # CAD meshing can take a minute: keep other API requests responsive.
      LOCK.release()
      try:glb=step_to_glb(raw)
      finally:LOCK.acquire()
      if len(glb)>50*1024*1024:raise ValueError('CAD-Konvertierung zu groß')
     except Exception as error:return self.send(422,{'error':'Raspberry Pi 5 CAD-Import fehlgeschlagen: '+str(error)[:280]})
     key=secrets.token_hex(12)
     name='Raspberry Pi 5 – offizielles STEP-CAD'
     c.execute('INSERT INTO cad_library(id,user_id,name,format,glb,updated) VALUES(?,?,?,?,?,?)',(key,current['id'],name,'step',glb,int(time.time())))
     return self.send(201,{'id':key,'name':name,'format':'step','size':len(glb),'source':url})
    if path=='/api/library/models' and method=='GET':
     rows=c.execute('SELECT id,name,format,length(glb) size,updated FROM cad_library WHERE user_id=? ORDER BY updated DESC',(current['id'],)).fetchall()
     return self.send(200,{'models':[dict(row) for row in rows]})
    if path=='/api/library/models' and method=='POST':
     try:length=int(self.headers.get('Content-Length','0'))
     except ValueError:return self.send(400,{'error':'Ungültige Dateigrösse'})
     if not 20<=length<=50*1024*1024:return self.send(413,{'error':'Maximal 50 MiB'})
     kind=self.headers.get('X-Model-Format','').lower()
     name=self.headers.get('X-Model-Name','Modell')[:120]
     raw=self.rfile.read(length)
     if len(raw)!=length:return self.send(400,{'error':'Datei unvollständig'})
     if kind=='stl':
      try:glb=stl_to_glb(raw)
      except (ValueError,UnicodeError,OverflowError,struct.error) as error:return self.send(422,{'error':str(error)})
     elif kind=='glb':
      glb=raw
      if len(glb)<12 or glb[:4]!=b'glTF' or int.from_bytes(glb[4:8],'little')!=2 or int.from_bytes(glb[8:12],'little')!=len(glb):return self.send(422,{'error':'Ungültiges GLB'})
     elif kind in ('step','stp'):
      try:glb=step_to_glb(raw)
      except (ValueError,OverflowError) as error:return self.send(422,{'error':str(error)})
     else:return self.send(415,{'error':'Nur GLB oder STL importierbar'})
     if len(glb)>50*1024*1024:return self.send(413,{'error':'Konvertiertes Modell ist zu gross'})
     key=secrets.token_hex(12)
     c.execute('INSERT INTO cad_library(id,user_id,name,format,glb,updated) VALUES(?,?,?,?,?,?)',(key,current['id'],name,kind,glb,int(time.time())))
     return self.send(201,{'id':key,'name':name,'format':kind,'size':len(glb)})
    if path.startswith('/api/library/models/'):
     key=path[len('/api/library/models/'):]
     if not (len(key)==24 and all(ch in '0123456789abcdef' for ch in key)):return self.send(400,{'error':'Ungültige ID'})
     if method=='GET':
      row=c.execute('SELECT glb FROM cad_library WHERE id=? AND user_id=?',(key,current['id'])).fetchone()
      if not row:return self.send(404,{'error':'Nicht gefunden'})
      binary=row['glb'];self.send_response(200);self.send_header('Content-Type','model/gltf-binary');self.send_header('Content-Length',str(len(binary)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(binary);return
     if method=='DELETE':
      c.execute('DELETE FROM cad_library WHERE id=? AND user_id=?',(key,current['id']))
      return self.send(200,{'deleted':True})
     return self.send(405,{'error':'Methode nicht erlaubt'})
    if path.startswith('/api/models/'):
     device_id=path[len('/api/models/'):]
     if not (1<=len(device_id)<=128 and all(ch.isalnum() or ch in '-_' for ch in device_id)):
      return self.send(400,{'error':'Ungültige Geräte-ID'})
     if method=='POST':
      try:length=int(self.headers.get('Content-Length','0'))
      except ValueError:return self.send(400,{'error':'Ungültige Dateigrösse'})
      if not 20<=length<=50*1024*1024:return self.send(413,{'error':'GLB muss zwischen 20 Byte und 50 MiB gross sein'})
      raw=self.rfile.read(length)
      if len(raw)!=length or raw[:4]!=b'glTF' or int.from_bytes(raw[4:8],'little')!=2 or int.from_bytes(raw[8:12],'little')!=length:
       return self.send(400,{'error':'Ungültige binäre glTF-2.0-Datei'})
      c.execute('INSERT INTO model_assets(user_id,device_id,glb,updated) VALUES(?,?,?,?) ON CONFLICT(user_id,device_id) DO UPDATE SET glb=excluded.glb,updated=excluded.updated',(current['id'],device_id,raw,int(time.time())))
      return self.send(200,{'saved':True,'size':length})
     if method=='GET':
      asset=c.execute('SELECT glb FROM model_assets WHERE user_id=? AND device_id=?',(current['id'],device_id)).fetchone()
      if not asset:return self.send(404,{'error':'GLB nicht gefunden'})
      binary=asset['glb'];self.send_response(200);self.send_header('Content-Type','model/gltf-binary');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(binary)));self.end_headers();self.wfile.write(binary);return
     if method=='DELETE':
      c.execute('DELETE FROM model_assets WHERE user_id=? AND device_id=?',(current['id'],device_id))
      return self.send(200,{'deleted':True})
     return self.send(405,{'error':'Methode nicht erlaubt'})
    if path=='/api/builds' and method=='GET':
     rows=c.execute('SELECT id,name,updated FROM builds WHERE user_id=? ORDER BY updated DESC',(current['id'],)).fetchall()
     return self.send(200,{'builds':[dict(v) for v in rows]})
    if path=='/api/builds' and method=='POST':
     name=str(data.get('name','')).strip()[:100];payload=data.get('data')
     if not name or not valid_rack_document(payload):return self.send(400,{'error':'Ungültige Rackdaten oder ungültige Verbindungen'})
     record_id=secrets.token_hex(16);c.execute('INSERT INTO builds(id,user_id,name,data,updated) VALUES(?,?,?,?,?)',(record_id,current['id'],name,json.dumps(payload),int(time.time())))
     return self.send(201,{'id':record_id})
    if path.startswith('/api/builds/'):
     bid=path.split('/')[-1];row=c.execute('SELECT * FROM builds WHERE id=? AND user_id=?',(bid,current['id'])).fetchone()
     if not row:return self.send(404,{'error':'Rack nicht gefunden'})
     if method=='GET':return self.send(200,{'id':bid,'name':row['name'],'data':json.loads(row['data'])})
     if method=='PUT':
      payload=data.get('data');name=str(data.get('name',row['name'])).strip()[:100]
      if not name or not valid_rack_document(payload):return self.send(400,{'error':'Ungültige Rackdaten oder ungültige Verbindungen'})
      c.execute('INSERT INTO build_revisions(build_id,user_id,name,data,saved_at) VALUES(?,?,?,?,?)',(bid,current['id'],row['name'],row['data'],int(time.time())))
      c.execute('DELETE FROM build_revisions WHERE build_id=? AND user_id=? AND id NOT IN (SELECT id FROM build_revisions WHERE build_id=? AND user_id=? ORDER BY id DESC LIMIT 20)',(bid,current['id'],bid,current['id']))
      c.execute('UPDATE builds SET name=?,data=?,updated=? WHERE id=? AND user_id=?',(name,json.dumps(payload),int(time.time()),bid,current['id']))
      return self.send(200,{'id':bid})
     if method=='DELETE':
      c.execute('DELETE FROM build_revisions WHERE build_id=? AND user_id=?',(bid,current['id']))
      c.execute('DELETE FROM builds WHERE id=? AND user_id=?',(bid,current['id']))
      return self.send(200,{'deleted':True})
    if path.startswith('/api/revisions/') and method=='GET':
     parts=path.split('/')
     if len(parts) not in (4,5):return self.send(404,{'error':'Not found'})
     bid=parts[3]
     existing=c.execute('SELECT id FROM builds WHERE id=? AND user_id=?',(bid,current['id'])).fetchone()
     if not existing:return self.send(404,{'error':'Rack nicht gefunden'})
     if len(parts)==4:
      rows=c.execute('SELECT id,name,saved_at FROM build_revisions WHERE build_id=? AND user_id=? ORDER BY id DESC LIMIT 20',(bid,current['id'])).fetchall()
      return self.send(200,{'revisions':[dict(v) for v in rows]})
     try:rid=int(parts[4])
     except ValueError:return self.send(404,{'error':'Version nicht gefunden'})
     version=c.execute('SELECT id,name,data,saved_at FROM build_revisions WHERE id=? AND build_id=? AND user_id=?',(rid,bid,current['id'])).fetchone()
     if not version:return self.send(404,{'error':'Version nicht gefunden'})
     return self.send(200,{'id':version['id'],'name':version['name'],'saved_at':version['saved_at'],'data':json.loads(version['data'])})
    return self.send(404,{'error':'Not found'})
  except Exception:
   return self.send(500,{'error':'Serverfehler'})
 def do_GET(self):self.handle_request('GET')
 def do_POST(self):self.handle_request('POST')
 def do_PUT(self):self.handle_request('PUT')
 def do_DELETE(self):self.handle_request('DELETE')
ThreadingHTTPServer(('0.0.0.0',int(os.getenv('HCC_PORT','8000'))),Handler).serve_forever()
