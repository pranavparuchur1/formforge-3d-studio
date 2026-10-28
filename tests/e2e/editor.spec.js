import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { validateBytes } from 'gltf-validator';
const state = page => page.evaluate(()=>window.__formforgeDiagnostics());
async function boot(page){await page.goto('/?diagnostics');await expect.poll(async()=>(await state(page)).frameCount).toBeGreaterThan(2);}
async function number(page,kind,axis,value){const input=page.getByRole('spinbutton',{name:`${kind} ${axis}`,exact:true});await input.fill(String(value));await input.press('Tab');}
async function download(page,type){await page.locator('#btn-export').click();const promise=page.waitForEvent('download');await page.locator(`[data-export="${type}"]`).click();const d=await promise;const bytes=await fs.readFile(await d.path());return {bytes,name:d.suggestedFilename()};}
test.beforeEach(async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error' && !page.__expectedModuleFailure)errors.push(m.text());});page.__errors=errors;});
test.afterEach(async({page})=>{expect(page.__errors).toEqual([]);});

test('completed WebGL frame, four nonzero meshes, picking, orbit and resize',async({page},info)=>{
 await boot(page);const s=await state(page);expect(s.project.objects).toHaveLength(4);expect(s.meshes).toHaveLength(4);expect(s.meshes.every(m=>m.bounds.every(x=>x>0))).toBe(true);
 await expect(page.locator('#viewport-placeholder')).toBeHidden();await expect(page.locator('#webgl-error')).toBeHidden();
 const canvas=page.locator('canvas');const pixels=await canvas.evaluate(c=>{const gl=c.getContext('webgl2'),a=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,a);return new Set(Array.from({length:a.length/4},(_,i)=>`${a[i*4]},${a[i*4+1]},${a[i*4+2]}`)).size;});expect(pixels).toBeGreaterThan(100);
 await page.screenshot({path:'artifacts/podium.png'});await info.attach('podium',{path:'artifacts/podium.png',contentType:'image/png'});
 const box=await canvas.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);expect((await state(page)).selectedId).toBeTruthy();
 const before=(await state(page)).camera;await page.mouse.move(box.x+box.width*.15,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.3,box.y+box.height*.7,{steps:12});await page.mouse.up();await page.waitForTimeout(350);expect((await state(page)).camera).not.toEqual(before);
 await page.setViewportSize({width:1200,height:800});await expect.poll(()=>canvas.evaluate(c=>Math.abs(c.width-c.getBoundingClientRect().width))).toBeLessThan(2);
});

test('primitives, inspector material/XYZ, clone/delete, undo/redo, Quick Build and persistence',async({page})=>{
 await boot(page);
 for(const type of ['box','sphere','cylinder','cone','torus'])await page.locator(`[data-shape="${type}"]`).click();
 expect((await state(page)).project.objects).toHaveLength(9);
 await number(page,'position','X',1.2);await number(page,'position','Y',2.3);await number(page,'position','Z',-.7);await number(page,'rotation','Y',45);await number(page,'scale','X',1.5);
 await page.locator('#custom-color').fill('#ec776d');await page.locator('#custom-color').dispatchEvent('change');await page.locator('#obj-metalness').fill('72');await page.locator('#obj-metalness').dispatchEvent('change');await page.locator('#obj-roughness').fill('31');await page.locator('#obj-roughness').dispatchEvent('change');
 const original=(await state(page)).project.objects.at(-1);expect(original.position).toEqual([1.2,2.3,-.7]);expect(original.color).toBe('#ec776d');expect(original.metalness).toBe(.72);expect(original.roughness).toBe(.31);
 await page.locator('#btn-duplicate').click();expect((await state(page)).project.objects.at(-1).id).not.toBe(original.id);await page.locator('#btn-delete').click();expect((await state(page)).project.objects).toHaveLength(9);await page.locator('#btn-undo').click();expect((await state(page)).project.objects).toHaveLength(10);await page.locator('#btn-redo').click();expect((await state(page)).project.objects).toHaveLength(9);
 await page.locator('#quick-command').fill('purple lamp');await page.locator('#btn-quick-build').click();expect((await state(page)).project.objects).toHaveLength(13);await page.locator('#btn-undo').click();expect((await state(page)).project.objects).toHaveLength(9);await page.locator('#btn-redo').click();
 const expected=(await state(page)).project;await expect(page.locator('#save-marker')).toHaveText('● Saved on this browser');await page.reload();await expect.poll(async()=>(await state(page)).frameCount).toBeGreaterThan(2);expect((await state(page)).project).toEqual(expected);
 await page.screenshot({path:'artifacts/edited-scene.png'});
});

test('JSON export/new/import preserves IDs, transforms and materials; invalid version keeps scene',async({page})=>{
 await boot(page);const expected=(await state(page)).project;const {bytes}=await download(page,'json');expect(JSON.parse(bytes)).toEqual(expected);
 page.on('dialog',d=>d.accept());await page.locator('#btn-new').click();expect((await state(page)).project.objects).toHaveLength(0);
 await page.locator('#file-input').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:bytes});await expect.poll(async()=>(await state(page)).project.objects.length).toBe(4);expect((await state(page)).project).toEqual(expected);
 await page.locator('#file-input').setInputFiles({name:'future.json',mimeType:'application/json',buffer:Buffer.from('{"version":999,"objects":[]}')});await expect(page.locator('#toast')).toContainText('Unsupported project version');expect((await state(page)).project).toEqual(expected);
});

test('GLB reload parity, binary STL geometry and decodable current-view PNG',async({page})=>{
 await boot(page);for(const type of ['box','sphere','cylinder','cone','torus']){await page.locator(`[data-shape="${type}"]`).click();await number(page,'scale','X',1.4);await number(page,'rotation','Z',15);}
 await page.getByRole('button',{name:'Select Hero object',exact:true}).click();await number(page,'position','X',1.2);await number(page,'rotation','Y',30);
 await page.locator('[data-visibility="shape-1"]').click();const s=await state(page);
 const {bytes:glb}=await download(page,'glb');const report=await validateBytes(new Uint8Array(glb));expect(report.issues.numErrors,JSON.stringify(report.issues)).toBe(0);await fs.writeFile('artifacts/gltf-validation.json',JSON.stringify(report,null,2));expect(glb.toString('ascii',0,4)).toBe('glTF');expect(glb.readUInt32LE(8)).toBe(glb.length);
 // Fresh loader instance in a separate document, independent of editor meshes.
 const viewer=await page.context().newPage();await viewer.goto('/tests/helpers/viewer.html');
 const loaded=await viewer.evaluate(async bytes=>{const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');const {Box3}=await import('/node_modules/three/build/three.module.js');const data=await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer,'');data.scene.updateMatrixWorld(true);const meshes=[];data.scene.traverse(m=>{if(m.isMesh)meshes.push({name:m.name,matrix:m.matrixWorld.toArray(),color:m.material.color.getHexString(),metalness:m.material.metalness,roughness:m.material.roughness,emissive:m.material.emissive.getHexString(),triangles:(m.geometry.index?.count ?? m.geometry.attributes.position.count)/3,min:new Box3().setFromObject(m,true).min.toArray(),max:new Box3().setFromObject(m,true).max.toArray(),vertices:m.geometry.attributes.position.count});});return meshes;},Array.from(glb));
 expect(loaded).toHaveLength(s.project.objects.filter(o=>o.visible).length);for(const [index,obj] of s.project.objects.filter(o=>o.visible).entries()){const mesh=loaded[index];expect(mesh,JSON.stringify(loaded)).toBeTruthy();const source=s.meshes.find(m=>m.id===obj.id);mesh.matrix.forEach((n,i)=>expect(n).toBeCloseTo(source.matrix[i],4));expect(mesh.triangles).toBe(source.triangles);for(const side of ['min','max'])mesh[side].forEach((n,i)=>expect(n).toBeCloseTo(source[side][i],4));expect('#'+mesh.color).toBe(obj.color);expect(mesh.metalness).toBeCloseTo(obj.metalness,5);expect(mesh.roughness).toBeCloseTo(obj.roughness,5);expect(mesh.emissive).toBe('000000');expect(mesh.vertices).toBeGreaterThan(0);}await viewer.close();
 page.once('dialog',d=>d.accept());const {bytes:stl}=await download(page,'stl');const count=stl.readUInt32LE(80);expect(count).toBeGreaterThan(0);expect(stl.length).toBe(84+50*count);let finite=true;for(let i=0;i<count;i++)for(let j=0;j<12;j++)finite &&= Number.isFinite(stl.readFloatLE(84+50*i+j*4));expect(finite).toBe(true);
 const visible=s.meshes.filter(m=>m.visible);expect(count).toBe(visible.reduce((n,m)=>n+m.triangles,0));
 const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 for(let i=0;i<count;i++)for(let v=0;v<3;v++)for(let axis=0;axis<3;axis++){const n=stl.readFloatLE(84+50*i+12+v*12+axis*4);bounds.min[axis]=Math.min(bounds.min[axis],n);bounds.max[axis]=Math.max(bounds.max[axis],n);}
 for(let axis=0;axis<3;axis++){expect(bounds.min[axis]).toBeCloseTo(Math.min(...visible.map(m=>m.min[axis])),4);expect(bounds.max[axis]).toBeCloseTo(Math.max(...visible.map(m=>m.max[axis])),4);}
 await fs.writeFile('artifacts/export-parity.json',JSON.stringify({glb:loaded,stl:{triangles:count,...bounds}},null,2));
 const {bytes:png}=await download(page,'png');expect(png.subarray(0,8)).toEqual(Buffer.from([137,80,78,71,13,10,26,10]));const dimensions=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'}));return [image.width,image.height];},Array.from(png));expect(dimensions).toEqual(await page.locator('canvas').evaluate(c=>[c.width,c.height]));
 await fs.writeFile('artifacts/export.glb',glb);await fs.writeFile('artifacts/export.stl',stl);await fs.writeFile('artifacts/export.png',png);
 const canvas=page.locator('canvas'),box=await canvas.boundingBox();await page.mouse.move(box.x+100,box.y+300);await page.mouse.down();await page.mouse.move(box.x+200,box.y+320,{steps:10});await page.mouse.up();await page.waitForTimeout(300);const second=await download(page,'png');expect(second.bytes.equals(png)).toBe(false);
});

test('all-hidden geometry and null PNG fail without downloads or losing scene',async({page})=>{
 await boot(page);for(const id of ['shape-1','shape-2','shape-3','shape-4'])await page.locator(`[data-visibility="${id}"]`).click();let downloads=0;page.on('download',()=>downloads++);
 await page.locator('#btn-export').click();await page.locator('[data-export="glb"]').click();await expect(page.locator('#toast')).toContainText('Show at least one');
 await page.evaluate(()=>HTMLCanvasElement.prototype.toBlob=function(callback){callback(null);});await page.locator('#btn-export').click();await page.locator('[data-export="png"]').click();await expect(page.locator('#toast')).toContainText('Could not capture PNG');expect(downloads).toBe(0);expect((await state(page)).project.objects).toHaveLength(4);
});

test('no WebGL keeps document editing and JSON rescue, with honest status',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args);};});await page.goto('/?diagnostics');await expect(page.locator('#webgl-error')).toBeVisible();await expect(page.locator('#live-state')).toHaveText('3D unavailable');await expect(page.locator('#viewport-placeholder')).toBeHidden();
 await page.locator('[data-shape="box"]').click();expect((await state(page)).project.objects).toHaveLength(5);const {bytes}=await download(page,'json');expect(JSON.parse(bytes).objects).toHaveLength(5);await page.screenshot({path:'artifacts/no-webgl.png'});
});

test('local editor works without third-party requests and module failure offers raw rescue',async({page})=>{
 const external=[];await page.route('**/*',route=>{if(new URL(route.request().url()).origin!=='http://127.0.0.1:5173'){external.push(route.request().url());return route.abort();}return route.continue();});await boot(page);expect(external).toEqual([]);
 await page.evaluate(()=>localStorage.setItem('formforge.project.v1','{"version":1,"objects":[]}'));await page.route('**/src/main.js',r=>r.abort());page.__expectedModuleFailure=true; // Deliberately blocked module request; recovery behavior is asserted.
 await page.reload();await expect(page.locator('#renderer-state')).toHaveText('LOAD ERROR',{timeout:16000});const promise=page.waitForEvent('download');await page.locator('#btn-rescue').click();const d=await promise;expect(await fs.readFile(await d.path(),'utf8')).toBe('{"version":1,"objects":[]}');page.__errors.length=0;
});

test('real move/rotate/scale gizmo drags preserve selection, freeze orbit and undo once',async({page})=>{
 await boot(page);await page.getByRole('button',{name:'Select Hero object',exact:true}).click();await page.waitForTimeout(500);
 const canvas=page.locator('canvas');const box=await canvas.boundingBox();
 for(const mode of ['translate','rotate','scale']){
  await page.locator(`[data-mode="${mode}"]`).click();await page.waitForTimeout(100);
  const before=await state(page);const pos=before.gizmo.position;const cx=box.x+(pos[0]+1)*box.width/2,cy=box.y+(1-pos[1])*box.height/2;
  let start;
  // Find an actual ray-hit on the X handle; no synthetic transform mutations.
  for(let radius=15;radius<=100&&!start;radius+=10)for(let angle=0;angle<360&&!start;angle+=30){const x=cx+Math.cos(angle*Math.PI/180)*radius,y=cy+Math.sin(angle*Math.PI/180)*radius;await page.mouse.move(x,y);if((await state(page)).gizmo.axis==='X')start={x,y};}
  expect(start,`${mode} X handle`).toBeTruthy();await page.mouse.move(start.x,start.y);await page.mouse.down();expect((await state(page)).gizmo.dragging).toBe(true);await page.mouse.move(start.x+40,start.y-25,{steps:15});await page.mouse.up();
  const after=await state(page);expect(after.selectedId).toBe(before.selectedId);expect(after.camera).toEqual(before.camera);expect(after.history).toBe(before.history+1);expect(after.project).not.toEqual(before.project);
  const obj=after.project.objects.find(o=>o.id===after.selectedId);const kind=mode==='translate'?'position':mode==='rotate'?'rotation':'scale';const field=page.getByRole('spinbutton',{name:`${kind} X`,exact:true});expect(Number(await field.inputValue())).toBeCloseTo(kind==='rotation'?obj.rotation[0]*180/Math.PI:obj[kind][0],0);
  await page.locator('#btn-undo').click();expect((await state(page)).project).toEqual(before.project);await page.locator('#btn-redo').click();expect((await state(page)).project).toEqual(after.project);
 }
 await page.screenshot({path:'artifacts/gizmo.png'});
});

test('native text undo does not undo scene; invalid numeric edit is rejected',async({page})=>{
 await boot(page);await page.locator('[data-shape="box"]').click();const before=await state(page);
 await page.locator('#obj-name').focus();await page.locator('#obj-name').press('End');await page.keyboard.type(' draft');await page.keyboard.press('Control+z');expect((await state(page)).history).toBe(before.history);expect((await state(page)).project).toEqual(before.project);
 await number(page,'position','X',101);await expect(page.getByRole('spinbutton',{name:'position X',exact:true})).toHaveAttribute('aria-invalid','true');expect((await state(page)).project).toEqual(before.project);
 await number(page,'position','X',1.5);expect((await state(page)).project.objects.at(-1).position[0]).toBe(1.5);
});

test('context loss preserves editing/JSON and restores current document',async({page})=>{
 await boot(page);await page.locator('canvas').evaluate(c=>{window.__loseContext=c.getContext('webgl2').getExtension('WEBGL_lose_context');window.__loseContext.loseContext();});await expect(page.locator('#renderer-state')).toHaveText('CONTEXT LOST');await page.locator('[data-shape="box"]').click();const {bytes}=await download(page,'json');expect(JSON.parse(bytes).objects).toHaveLength(5);
 await page.evaluate(()=>window.__loseContext.restoreContext());await expect(page.locator('#renderer-state')).toHaveText('WEBGL2');expect((await state(page)).meshes).toHaveLength(5);
});

test('Escape and pointercancel roll back gizmo previews; short gizmo click keeps selection',async({page})=>{
 await boot(page);await page.getByRole('button',{name:'Select Hero object',exact:true}).click();const canvas=page.locator('canvas'),box=await canvas.boundingBox();const before=await state(page),pos=before.gizmo.position;const cx=box.x+(pos[0]+1)*box.width/2,cy=box.y+(1-pos[1])*box.height/2;let start;
 for(let radius=15;radius<=100&&!start;radius+=10)for(let angle=0;angle<360&&!start;angle+=30){const x=cx+Math.cos(angle*Math.PI/180)*radius,y=cy+Math.sin(angle*Math.PI/180)*radius;await page.mouse.move(x,y);if((await state(page)).gizmo.axis==='X')start={x,y};}
 expect(start).toBeTruthy();await page.mouse.click(start.x,start.y);expect((await state(page)).selectedId).toBe(before.selectedId);expect((await state(page)).history).toBe(before.history);
 for(const cancellation of ['Escape','pointercancel']){await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(start.x+45,start.y-20,{steps:10});if(cancellation==='Escape')await page.keyboard.press('Escape');else await canvas.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await page.mouse.up();const after=await state(page);expect(after.project).toEqual(before.project);expect(after.history).toBe(before.history);expect(after.gizmo.dragging).toBe(false);expect(after.camera).toEqual(before.camera);}
});
