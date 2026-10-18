import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from '@babylonjs/core';
import {routeRackCable,softenCablePath} from '../src/3d/CableRouter.ts';
const rackWidth=.48,depth=.8;
const ends=(a,b)=>routeRackCable(a,b,rackWidth,depth,0);
test('front cables stay in front except for exterior side gutter',()=>{
 const path=ends({point:new Vector3(-.08,.12,-.46),face:'front'},{point:new Vector3(.08,.72,-.46),face:'front'});
 assert.ok(path.every(p=>p.z<=-.4),'front cable entered rack interior');
 assert.ok(path.some(p=>Math.abs(p.x)>.24),'side gutter is missing');
});
test('rear cables remain behind rack',()=>{
 const path=ends({point:new Vector3(-.08,.12,.46),face:'rear'},{point:new Vector3(.08,.72,.46),face:'rear'});
 assert.ok(path.every(p=>p.z>=.4),'rear cable entered rack interior');
});
test('front to rear cable transitions only outside the side wall',()=>{
 const path=ends({point:new Vector3(-.08,.12,-.46),face:'front'},{point:new Vector3(.08,.72,.46),face:'rear'});
 for(let i=0;i<path.length-1;i++){const p=path[i],q=path[i+1];if(p.z*q.z<0)assert.ok(Math.abs(p.x)>.24&&Math.abs(q.x)>.24,'cable cuts through rack');}
 assert.ok(softenCablePath(path).length>path.length,'path should round its corners');
});
