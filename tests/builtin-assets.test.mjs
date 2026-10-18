import test from 'node:test';
import assert from 'node:assert/strict';
import {builtInNas} from '../src/3d/built-in-nas.ts';

test('bundled NAS 3D model decompresses to a complete binary GLB',async()=>{
 const asset=await builtInNas();
 const bytes=new Uint8Array(await asset.arrayBuffer());
 assert.ok(bytes.byteLength>10000,'binary glb should not be empty');
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 assert.equal(String.fromCharCode(...bytes.slice(0,4)),'glTF');
 assert.equal(dv.getUint32(4,true),2,'GLB v2');
 assert.equal(dv.getUint32(8,true),bytes.length,'GLB binary size');
});
