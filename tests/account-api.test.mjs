import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('username-only profile: select, save, read, update, list and delete rack via real API',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'rack-api-'));const port=18573;
 const child=spawn('python3',['-u','server/app.py'],{env:{...process.env,HCC_DB:join(directory,'racks.sqlite'),HCC_PORT:String(port)},stdio:'ignore'});
 const url='http://127.0.0.1:'+port+'/api/';let cookie='';
 const request=async(path,method='GET',body)=>{const res=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});const session=res.headers.get('set-cookie');if(session)cookie=session.split(';')[0];return{status:res.status,data:await res.json()}};
 try{
  let ready=false;
  for(let i=0;i<80;i++){if(child.exitCode!==null)throw Error('API exited');try{const r=await request('me');if(r.status===200){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}
  assert.ok(ready,'API did not start');
  let r=await request('select-user','POST',{username:'racktester'});assert.equal(r.status,200);assert.equal(r.data.username,'racktester');
  const payload={rack:{width:19,units:20,devices:[]},cables:[],services:{}};
  r=await request('builds','POST',{name:'Erstes Rack',data:payload});assert.equal(r.status,201);const id=r.data.id;
  r=await request('builds/'+id);assert.deepEqual(r.data.data,payload);
  r=await request('builds/'+id,'PUT',{name:'Aktualisiert',data:{...payload,cables:[{a:'x',b:'y'}]}});assert.equal(r.status,200);
  r=await request('builds');assert.equal(r.data.builds.length,1);assert.equal(r.data.builds[0].name,'Aktualisiert');
  r=await request('builds/'+id,'DELETE');assert.equal(r.status,200);
  r=await request('builds');assert.equal(r.data.builds.length,0);
 }finally{child.kill();await rm(directory,{recursive:true,force:true})}
});
