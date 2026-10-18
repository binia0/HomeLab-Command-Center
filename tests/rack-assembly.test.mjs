import test from 'node:test';import assert from 'node:assert/strict';
import {createLcdPiAssembly,validateConnection} from '../src/lib/rack-assembly.ts';
const blank={width:19,units:20,depthMm:800,devices:[]};
test('LCD/Pi creates precisely one device and no external HDMI cable',()=>{
 const r=createLcdPiAssembly(blank,'Rack Monitor','lcd-pi-1');assert.equal(r.ok,true);
 if(!r.ok)return;assert.equal(r.device.category,'lcd-pi');assert.equal(r.device.height,2);assert.equal(r.device.u,1);assert.deepEqual(r.device.ports.map(p=>p.id),['eth0','power']);
});
test('LCD/Pi auto placement skips occupied 2U sections and handles last pair',()=>{
 const occupied={...blank,units:6,devices:[{id:'x',u:1,height:4,ports:[]}]};
 const r=createLcdPiAssembly(occupied,'LCD','x2');assert.equal(r.ok,true);if(r.ok)assert.equal(r.device.u,5);
});
test('LCD/Pi refuses a rack with no free 2U position',()=>{
 const r=createLcdPiAssembly({...blank,units:2,devices:[{id:'x',u:1,height:2,ports:[]}]},'LCD','x2');assert.equal(r.ok,false);
});
test('cables require existing distinct compatible free ports',()=>{
 const a={id:'a',u:1,height:1,ports:[{id:'lan',type:'RJ45'}]};
 const b={id:'b',u:3,height:1,ports:[{id:'lan',type:'RJ45'},{id:'hdmi',type:'HDMI'}]};
 const cfg={...blank,devices:[a,b]};
 assert.equal(validateConnection(cfg,[],'a/lan','b/lan'),null);
 assert.match(validateConnection(cfg,[],'a/lan','b/hdmi'),/nicht kompatibel/);
 assert.match(validateConnection(cfg,[{a:'a/lan',b:'b/lan'}],'a/lan','b/lan'),/belegt/);
 assert.match(validateConnection(cfg,[],'a/lan','a/lan'),/demselben/);
});
