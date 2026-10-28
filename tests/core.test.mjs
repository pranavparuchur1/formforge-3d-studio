import test from 'node:test';
import assert from 'node:assert/strict';
import { addShape, addPreset, duplicateShape, emptyProject, makeObject, newDemoProject, normalizeProject, parseQuickBuild, restore, snapshot, MAX_OBJECTS } from '../src/scene-core.mjs';

test('starter scene has correct geometric objects', () => {
 const p = newDemoProject();
 assert.equal(p.objects.length, 4);
 assert.ok(p.objects.some(o => o.name === 'Hero object'));
});
test('IDs remain unique after adding, duplicating and importing', () => {
 const p = emptyProject();
 const a = addShape(p, 'box'); const b = duplicateShape(p,a.id);
 assert.notEqual(a.id,b.id);
 const roundTrip = restore(snapshot(p));
 assert.notEqual(addShape(roundTrip, 'sphere').id,b.id);
});
test('prompt parsing is deterministic and never pretends to be an AI model', () => {
 assert.deepEqual(parseQuickBuild('Make a red chair'), {kind:'preset',value:'chair', color:'#ec776d'});
 assert.equal(parseQuickBuild('create a blue ball').value, 'sphere');
 assert.equal(parseQuickBuild('a space station on Mars'),null);
});
test('import sanitizes scale, colors and bad geometry', () => {
 const p = normalizeProject({name:'Scene',objects:[{id:'x',type:'box',scale:[-55,Infinity,900],color:'alert(1)'},{type:'bad'}]});
 assert.equal(p.objects.length,1);
 assert.deepEqual(p.objects[0].scale,[0.05,1,40]);
 assert.equal(p.objects[0].color,'#98a7ff');
});
test('furniture preset creates the expected parts', () => {
 const p = emptyProject(); const items = addPreset(p,'chair');
 assert.equal(items.length, 6);
 assert.equal(items.filter(o => o.name === 'Chair • leg').length,4);
});
test('does not exceed geometry limits', () => {
 const p = emptyProject(); for(let i=0;i<MAX_OBJECTS;i++) addShape(p,'box');
 assert.throws(()=>addShape(p,'box'),/at most/);
 assert.throws(()=>addPreset(p,'rocket'),/Too many/);
});
test('malicious and repeated ids are replaced by unique safe ids', () => {
 const p=normalizeProject({objects:[{id:'shape-2',type:'box'},{id:'shape-2',type:'sphere'},{id:'\" onclick=\"alert(1)',type:'cone'}]});
 assert.equal(new Set(p.objects.map(o=>o.id)).size,3);
 assert.ok(p.objects.every(o=>/^[a-zA-Z0-9_-]{1,64}$/.test(o.id)));
});
test('invalid imported projects are rejected', () => {
 assert.throws(()=>normalizeProject({no:'shapes'}),/not a FormForge project/);
 assert.throws(()=>makeObject('a','monkey'),/Unknown geometry/);
});
