"""Backend smoke tests using only Python's standard library.

Run: python3 -m unittest discover -s server/tests -v
Tests use a temporary database and an ephemeral localhost port.
"""
import http.client
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

SERVER=Path(__file__).resolve().parents[1]/"app.py"

class ApiSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        with socket.socket() as sock:
            sock.bind(("127.0.0.1",0))
            cls.port=sock.getsockname()[1]
        env={**os.environ,"HCC_DB":str(Path(cls.temp.name)/"test.sqlite3"),"HCC_PORT":str(cls.port)}
        cls.process=subprocess.Popen([sys.executable,str(SERVER)],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
        for _ in range(70):
            try:
                with socket.create_connection(("127.0.0.1",cls.port),timeout=.2):
                    break
            except OSError:
                if cls.process.poll() is not None:
                    raise RuntimeError("Server exited before startup")
                time.sleep(.1)
        else:
            raise RuntimeError("Server failed to start")
    @classmethod
    def tearDownClass(cls):
        cls.process.terminate()
        try:cls.process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            cls.process.kill()
        cls.process.stderr.close()
        cls.temp.cleanup()
    def request(self,method,path,payload=None,raw=None):
        conn=http.client.HTTPConnection("127.0.0.1",self.port,timeout=4)
        headers={}
        body=None
        if payload is not None:
            headers["Content-Type"]="application/json"
            body=json.dumps(payload).encode()
        if raw is not None:
            headers["Content-Type"]="model/gltf-binary"
            body=raw
        if getattr(self,"cookie",None):
            headers["Cookie"]=self.cookie
        conn.request(method,path,body=body,headers=headers)
        response=conn.getresponse()
        data=response.read()
        cookie=response.getheader("Set-Cookie")
        if cookie and "rack_session=" in cookie:
            self.cookie=cookie.split(";",1)[0]
        status=response.status
        conn.close()
        if response.getheader("Content-Type","").startswith("application/json"):
            return status,json.loads(data)
        return status,data
    def test_revisions_and_glb(self):
        self.cookie=None
        status,_=self.request("POST","/api/select-user",{"username":"smoketest"})
        self.assertEqual(status,200)
        rack={"rack":{"width":10,"units":8,"devices":[]},"cables":[],"services":{}}
        status,body=self.request("POST","/api/builds",{"name":"Rack 1","data":rack})
        self.assertEqual(status,201)
        bid=body["id"]
        status,_=self.request("PUT","/api/builds/"+bid,{"name":"Rack 2","data":rack})
        self.assertEqual(status,200)
        status,body=self.request("GET","/api/revisions/"+bid)
        self.assertEqual(status,200)
        self.assertEqual(len(body["revisions"]),1)
        revision=body["revisions"][0]["id"]
        status,body=self.request("GET",f"/api/revisions/{bid}/{revision}")
        self.assertEqual(status,200)
        self.assertEqual(body["name"],"Rack 1")
        glb=b"glTF"+(2).to_bytes(4,"little")+(20).to_bytes(4,"little")+(b"\x00"*8)
        status,body=self.request("POST","/api/models/test_device",raw=glb)
        self.assertEqual(status,200)
        status,stored=self.request("GET","/api/models/test_device")
        self.assertEqual(status,200)
        self.assertEqual(stored,glb)
        status,_=self.request("DELETE","/api/models/test_device")
        self.assertEqual(status,200)
        status,_=self.request("GET","/api/models/test_device")
        self.assertEqual(status,404)
        status,_=self.request("DELETE","/api/builds/"+bid)
        self.assertEqual(status,200)
        status,_=self.request("GET","/api/revisions/"+bid)
        self.assertEqual(status,404)

if __name__=="__main__":
    unittest.main()
