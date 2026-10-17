import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyRack, gridSlots, validatePlacement, validateCable, removeDevice } from '../src/lib/rack-domain.ts';

const rack = { id: 'rack', name: 'Test', standard: 10, units: 20, depthMm: 300 };
const panel = (id, face, unit, depthMm = 75) => ({ id, rackId: 'rack', name: id, unit, units: 2, face, depthMm, slots: [] });
test('new racks can be truly empty', () => {
  const r = createEmptyRack('Demo', 19, 42, 700);
  assert.equal(r.standard, 19);
  assert.equal(r.units, 42);
});
test('universal panels generate 8x1 and 4x2', () => {
  const a = gridSlots(8, 1, 200, 70);
  const b = gridSlots(4, 2, 200, 70);
  assert.equal(a.length, 8);
  assert.equal(b.length, 8);
  assert.notEqual(a[0].localPositionMm.y, b[4].localPositionMm.y);
  assert.equal(a.filter(s => s.occupantId !== null).length, 0);
});
test('mounting on opposite faces can share a U if depths fit', () => {
  assert.deepEqual(validatePlacement(rack, panel('rear', 'rear', 10), [panel('front', 'front', 10)]), []);
  assert.ok(validatePlacement(rack, panel('rear', 'rear', 10, 180), [panel('front', 'front', 10, 180)]).length);
});
test('independently addressed same-model ports do not conflict', () => {
  const a = { id: 'switch-a/p1', deviceId: 'switch-a', label: '1', type: 'RJ45', face: 'front', localPositionMm: {x:0,y:0,z:0}, normal:{x:0,y:0,z:-1} };
  const b = { ...a, id:'switch-b/p1',deviceId:'switch-b' };
  const c = { ...a, id:'switch-c/p1',deviceId:'switch-c' };
  assert.equal(validateCable(a,b,[]), null);
  assert.equal(validateCable(c,b,[{id:'cable1',fromPortId:a.id,toPortId:b.id,type:'RJ45'}]), 'One or both ports are already occupied');
  assert.equal(validateCable(c,{...b,id:'switch-d/p1',deviceId:'switch-d'},[]), null);
});
test('device removal empties only its slot', () => {
  const slots = gridSlots(2,1,200,80);
  const devices = [{id:'pi1',name:'Pi 1',ports:[]},{id:'pi2',name:'Pi 2',ports:[]}];
  slots[0].occupantId='pi1';slots[1].occupantId='pi2';
  const r=removeDevice('pi1',devices,[{...panel('holder','front',1),slots}],[]);
  assert.ok(!('error' in r));
  assert.equal(r.panels[0].slots[0].occupantId,null);
  assert.equal(r.panels[0].slots[1].occupantId,'pi2');
});
