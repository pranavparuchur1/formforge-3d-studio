import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { addShape, addPreset, duplicateShape, emptyProject, normalizeProject, newDemoProject, parseQuickBuild, PALETTE, restore, snapshot } from './scene-core.mjs';

const $ = id => document.getElementById(id);
const el = {
  viewport:$('viewport'), projectName:$('project-name'), layers:$('layers'), layerCount:$('layer-count'), objectCount:$('object-count'),
  inspectorEmpty:$('inspector-empty'), inspectorEditor:$('inspector-editor'), typeIcon:$('selected-type-icon'), typeName:$('selected-type-name'),
  objName:$('obj-name'), colors:$('colors'), colorHex:$('color-hex'), customColor:$('custom-color'), metal:$('obj-metalness'),
  metalValue:$('metal-value'), rough:$('obj-roughness'), roughValue:$('rough-value'), quickCommand:$('quick-command'),
  toast:$('toast'), selectedFooter:$('selection-footer'), exportMenu:$('export-menu'), gridButton:$('btn-grid'),
  webglError:$('webgl-error'), rendererState:$('renderer-state'), undo:$('btn-undo'), redo:$('btn-redo'), fileInput:$('file-input'),
};
const ICONS = { box:'⬡', sphere:'●', cylinder:'▤', cone:'▲', torus:'◉' };
const STORE_KEY = 'formforge.project.v1';
const MAX_HISTORY = 65;
let project;
try { project = restore(localStorage.getItem(STORE_KEY)); } catch { project = newDemoProject(); }
let selectedId = null;
let mode = 'translate';
let scene, camera, renderer, orbit, gizmo, grid, exportParent;
let history = [], future = [];
let saveTimeout = null, toastTimeout = null, dragBefore = null;
let isReady = false;
const meshMap = new Map();
const round = (n, count = 2) => Number(n.toFixed(count));
const degrees = r => r * 180 / Math.PI;
const radians = d => d * Math.PI / 180;
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function toast(message, type='info') {
  el.toast.textContent = (type==='error' ? '⚠  ' : '✦  ') + message;
  el.toast.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(()=>el.toast.classList.add('hidden'), 3300);
}
function persist() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(()=>{
    try { localStorage.setItem(STORE_KEY, snapshot(project)); }
    catch { toast('Browser storage is full. Export your project as JSON.', 'error'); }
  }, 180);
}
function mutate(action) {
  const before = snapshot(project);
  try {
    const result = action();
    if (snapshot(project) !== before) {
      history.push(before); if(history.length>MAX_HISTORY) history.shift();
      future = [];
      syncAll();
      persist();
    }
    return result;
  } catch(err) { toast(err.message || 'Something went wrong.', 'error'); return null; }
}
function updateHistoryButtons() { el.undo.disabled = history.length===0;el.redo.disabled = future.length===0; }
function undo() {
  if (!history.length) return;
  future.push(snapshot(project)); project = restore(history.pop());
  if (!project.objects.some(o=>o.id===selectedId)) selectedId = null;
  syncAll();persist();toast('Undid last change');
}
function redo() {
  if (!future.length) return;
  history.push(snapshot(project));project = restore(future.pop());
  if (!project.objects.some(o=>o.id===selectedId)) selectedId=null;
  syncAll();persist();toast('Redid change');
}
function currentShape() { return project.objects.find(o=>o.id===selectedId) || null; }
function addGeometry(type) {
  const obj=mutate(()=>addShape(project,type,{position:[(project.objects.length%5-2)*.65,.8,0]}));
  if(obj){select(obj.id);toast(`${obj.name} added`);}
}
function buildPreset(preset, color) {
  const items=mutate(()=>addPreset(project,preset,color));
  if(items?.length){ select(items.at(-1).id);frameAll();toast(`${preset[0].toUpperCase()+preset.slice(1)} added · ${items.length} editable objects`); }
}
function duplicateSelected() {
  if(!selectedId){toast('Select an object first');return;}
  const obj=mutate(()=>duplicateShape(project,selectedId));
  if(obj){select(obj.id);toast('Object duplicated');}
}
function deleteSelected() {
  if(!selectedId){toast('Select an object first');return;}
  const id=selectedId; selectedId=null;
  mutate(()=>{project.objects=project.objects.filter(o=>o.id!==id);});
  toast('Object deleted');
}
function select(id) {
  selectedId=project.objects.some(o=>o.id===id)?id:null;
  attachGizmo();updateVisualSelection();renderLayers();renderInspector();
  el.selectedFooter.textContent = currentShape() ? `${currentShape().name.toUpperCase()} SELECTED` : 'SELECT AN OBJECT TO EDIT';
}
function geometryFor(type) {
  switch(type){
    case 'box':return new THREE.BoxGeometry(1,1,1);
    case 'sphere':return new THREE.SphereGeometry(.5,40,28);
    case 'cylinder':return new THREE.CylinderGeometry(.5,.5,1,40);
    case 'cone':return new THREE.ConeGeometry(.5,1,40);
    case 'torus':return new THREE.TorusGeometry(.48,.14,18,60);
    default:throw new Error('Unsupported object geometry');
  }
}
function createMesh(shape) {
  const material=new THREE.MeshStandardMaterial({color:shape.color,metalness:shape.metalness,roughness:shape.roughness});
  const mesh=new THREE.Mesh(geometryFor(shape.type),material);
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.formforgeId=shape.id;mesh.userData.geometryType=shape.type;mesh.name=shape.name;
  scene.add(mesh);meshMap.set(shape.id,mesh);return mesh;
}
function syncAll() {
  if(!isReady) return;
  const keep=new Set(project.objects.map(o=>o.id));
  for(const [id,mesh] of meshMap) if(!keep.has(id)) {
    if(id===selectedId) gizmo.detach();
    scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();meshMap.delete(id);
  }
  for(const obj of project.objects){
    let mesh=meshMap.get(obj.id);
    if(mesh && mesh.userData.geometryType!==obj.type){
      if(selectedId===obj.id)gizmo.detach();
      scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();meshMap.delete(obj.id);mesh=null;
    }
    mesh=mesh||createMesh(obj);
    mesh.name=obj.name;
    mesh.position.fromArray(obj.position);mesh.rotation.set(...obj.rotation);mesh.scale.fromArray(obj.scale);
    mesh.material.color.set(obj.color);mesh.material.metalness=obj.metalness;mesh.material.roughness=obj.roughness;
    mesh.visible=obj.visible;
  }
  if(!project.objects.some(o=>o.id===selectedId)) selectedId=null;
  attachGizmo();updateVisualSelection();renderLayers();renderInspector();
  el.projectName.value=project.name;el.layerCount.textContent=String(project.objects.length);
  el.objectCount.textContent=`${project.objects.length} OBJECT${project.objects.length!==1?'S':''}`;
  el.selectedFooter.textContent=currentShape() ? `${currentShape().name.toUpperCase()} SELECTED` : 'SELECT AN OBJECT TO EDIT';
  updateHistoryButtons();
}
function attachGizmo() {
  if(!gizmo) return;
  const mesh=meshMap.get(selectedId);
  if(mesh && mesh.visible){gizmo.attach(mesh);gizmo.setMode(mode);} else gizmo.detach();
}
function updateVisualSelection() {
  for(const [id,mesh] of meshMap) mesh.material.emissive.set(id===selectedId?'#222039':'#000000');
}
function renderLayers() {
  el.layers.innerHTML=project.objects.length ? [...project.objects].reverse().map(o=>
    `<div class="layer ${o.id===selectedId?'active':''}" data-id="${escapeHtml(o.id)}"><button class="layer-pick" aria-label="Select ${escapeHtml(o.name)}" data-layer-pick="${escapeHtml(o.id)}"><span class="layer-shape">${ICONS[o.type]}</span><span class="layer-name">${escapeHtml(o.name)}</span></button><button class="layer-visibility" data-visibility="${escapeHtml(o.id)}" title="Toggle visibility">${o.visible?'◉':'○'}</button></div>`
  ).join('') : '<div class="layers-empty">No objects yet. Add a shape or choose a starter scene.</div>';
}
function renderInspector() {
  const shape=currentShape();
  el.inspectorEmpty.classList.toggle('hidden',!!shape);
  el.inspectorEditor.classList.toggle('hidden',!shape);
  if(!shape) return;
  el.typeIcon.textContent=ICONS[shape.type];
  el.typeName.textContent=shape.type[0].toUpperCase()+shape.type.slice(1);
  el.objName.value=shape.name;el.customColor.value=shape.color;el.colorHex.textContent=shape.color.toUpperCase();
  el.colors.innerHTML=PALETTE.map(color=>`<button class="swatch ${shape.color.toLowerCase()===color.toLowerCase()?'active':''}" style="--swatch:${color}" data-color="${color}" aria-label="Set color ${color}" title="${color}"></button>`).join('');
  el.metal.value=String(Math.round(shape.metalness*100));el.metalValue.textContent=`${el.metal.value}%`;
  el.rough.value=String(Math.round(shape.roughness*100));el.roughValue.textContent=`${el.rough.value}%`;
  for(const kind of ['position','rotation','scale']){
    const values=shape[kind];
    $(`transform-${kind}`).innerHTML=values.map((n,i)=>`<div class="number-field"><label for="field-${kind}-${i}">${'XYZ'[i]}</label><input id="field-${kind}-${i}" data-transform="${kind}" data-index="${i}" type="number" step="0.1" value="${round(kind==='rotation'?degrees(n):n,1)}" aria-label="${kind} ${'XYZ'[i]}" /></div>`).join('');
  }
}
function refreshTransformFields() {
  const shape=currentShape();if(!shape)return;
  for(const kind of ['position','rotation','scale']) for(let i=0;i<3;i++){
    const field=$(`field-${kind}-${i}`);
    if(field && document.activeElement!==field)field.value=round(kind==='rotation'?degrees(shape[kind][i]):shape[kind][i],1);
  }
}
function setMode(nextMode) {
  mode=nextMode;
  if(gizmo) gizmo.setMode(mode);
  document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));
}
function resetCamera(){
  if(!camera||!orbit)return;
  camera.position.set(7,5.4,9);orbit.target.set(0,1.0,0);orbit.update();
}
function frameAll(){
  if(!camera||!orbit)return;
  const meshes=[...meshMap.values()].filter(m=>m.visible);
  if(!meshes.length){resetCamera();return;}
  const bounds=new THREE.Box3();for(const mesh of meshes)bounds.expandByObject(mesh);
  zoomToBounds(bounds);
}
function focusSelected() {
  const mesh=meshMap.get(selectedId);
  if(mesh && mesh.visible)zoomToBounds(new THREE.Box3().setFromObject(mesh));
  else frameAll();
}
function zoomToBounds(bounds){
  const center=bounds.getCenter(new THREE.Vector3()),sphere=bounds.getBoundingSphere(new THREE.Sphere());
  const distance=Math.max(sphere.radius*2.9,3.0);
  const direction=camera.position.clone().sub(orbit.target).normalize();
  orbit.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);camera.near=.01;camera.far=500;camera.updateProjectionMatrix();orbit.update();
}
function getExportObject() {
  const group=new THREE.Group();group.name=project.name;
  for(const o of project.objects){
    if(!o.visible)continue;
    const mesh=meshMap.get(o.id);if(!mesh)continue;
    const clone=mesh.clone();clone.material=mesh.material.clone();clone.material.emissive.set('#000000');
    group.add(clone);
  }
  return group;
}
function download(content,mime,name){
  const blob=content instanceof Blob?content:new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function safeFilename(){return (project.name.replace(/[^a-z0-9-_ ]/gi,'').trim().replace(/\s+/g,'-') || 'formforge-scene').slice(0,70).toLowerCase();}
async function exportAs(type){
  el.exportMenu.classList.add('hidden');$('btn-export').setAttribute('aria-expanded','false');
  try{
    if(type==='json'){download(JSON.stringify(project,null,2),'application/json',`${safeFilename()}.json`);toast('Editable project exported');return;}
    if(type==='png'){renderer.render(scene,camera);download(await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png')),'image/png',`${safeFilename()}.png`);toast('Viewport image exported');return;}
    if(!project.objects.length){toast('Add objects before exporting', 'error');return;}
    const group=getExportObject();
    if(type==='glb'){
      const exporter=new GLTFExporter();
      const buffer=await exporter.parseAsync(group,{binary:true});
      download(buffer,'model/gltf-binary',`${safeFilename()}.glb`);
      toast('3D model exported as GLB');
    }else if(type==='stl'){
      const exporter=new STLExporter();
      group.updateMatrixWorld(true);
      const stl=exporter.parse(group,{binary:true});
      download(stl,'model/stl',`${safeFilename()}.stl`);
      toast('STL exported · check manifold geometry before 3D printing');
    }
    group.traverse(o=>{if(o.isMesh)o.material.dispose();});
  }catch(err){console.error(err);toast(`Export failed: ${err.message}`, 'error');}
}
function setupThree() {
  if(!document.createElement('canvas').getContext('webgl2'))throw new Error('WebGL 2 is unavailable.');
  scene=new THREE.Scene();scene.background=new THREE.Color('#171a29');scene.fog=new THREE.Fog('#171a29',20,55);
  camera=new THREE.PerspectiveCamera(46,1,.1,400);camera.position.set(7,5.4,9);
  renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  el.viewport.appendChild(renderer.domElement);
  orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.minDistance=2;orbit.maxDistance=60;
  orbit.maxPolarAngle=Math.PI*.49;orbit.target.set(0,1,0);orbit.update();
  scene.add(new THREE.HemisphereLight('#d6e2ff','#58516a',2.1));
  const key=new THREE.DirectionalLight('#ffebd6',3.2);key.position.set(-4,9,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.left=-18;key.shadow.camera.right=18;key.shadow.camera.top=18;key.shadow.camera.bottom=-18;key.shadow.bias=-.00015;scene.add(key);
  const rim=new THREE.DirectionalLight('#97a8ff',2);rim.position.set(6,5,-8);scene.add(rim);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:'#1d2030',roughness:.9,metalness:.05}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
  grid=new THREE.GridHelper(100,100,'#474d68','#2b2e41');grid.position.y=.004;grid.material.opacity=.45;grid.material.transparent=true;scene.add(grid);
  gizmo=new TransformControls(camera,renderer.domElement);gizmo.setSize(.75);scene.add(gizmo.getHelper());
  gizmo.addEventListener('dragging-changed',event=>{orbit.enabled=!event.value;});
  gizmo.addEventListener('mouseDown',()=>{dragBefore=snapshot(project);});
  gizmo.addEventListener('objectChange',()=>{
    const shape=currentShape(),mesh=meshMap.get(selectedId);if(!shape||!mesh)return;
    shape.position=mesh.position.toArray().map(n=>round(n,5));shape.rotation=[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z].map(n=>round(n,5));
    shape.scale=mesh.scale.toArray().map(n=>Math.max(.05,round(n,5)));
    refreshTransformFields();
  });
  gizmo.addEventListener('mouseUp',()=>{
    if(dragBefore && dragBefore!==snapshot(project)){
      history.push(dragBefore);if(history.length>MAX_HISTORY)history.shift();future=[];persist();updateHistoryButtons();
    }
    dragBefore=null;
  });
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects([...meshMap.values()].filter(m=>m.visible),false);
    select(hits.length?hits[0].object.userData.formforgeId:null);
    down=null;
  });
  const resize=()=>{
    const rect=el.viewport.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
    camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);
  };
  const observer=new ResizeObserver(resize);observer.observe(el.viewport);resize();
  function animate(){requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera);}
  animate();
  isReady=true;window.__formforgeReady=true;$('viewport-placeholder').classList.add('hidden');
  syncAll();
  return {renderer,observer};
}
function installHandlers(){
  $('shapes-grid').addEventListener('click',e=>{const button=e.target.closest('[data-shape]');if(button)addGeometry(button.dataset.shape);});
  $('presets-list').addEventListener('click',e=>{const button=e.target.closest('[data-preset]');if(button)buildPreset(button.dataset.preset);});
  $('btn-add-cube').addEventListener('click',()=>addGeometry('box'));
  el.layers.addEventListener('click',e=>{
    const visibility=e.target.closest('[data-visibility]');
    if(visibility){const id=visibility.dataset.visibility;mutate(()=>{const o=project.objects.find(o=>o.id===id);if(o)o.visible=!o.visible;});return;}
    const pick=e.target.closest('[data-layer-pick]');if(pick)select(pick.dataset.layerPick);
  });
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  $('btn-duplicate').addEventListener('click',duplicateSelected);$('btn-delete').addEventListener('click',deleteSelected);
  $('inspector-duplicate').addEventListener('click',duplicateSelected);$('inspector-delete').addEventListener('click',deleteSelected);
  $('btn-frame').addEventListener('click',focusSelected);$('btn-reset-view').addEventListener('click',resetCamera);
  el.gridButton.addEventListener('click',()=>{grid.visible=!grid.visible;el.gridButton.classList.toggle('active',grid.visible);toast(grid.visible?'Grid shown':'Grid hidden');});
  el.projectName.addEventListener('change',()=>mutate(()=>{project.name=el.projectName.value.trim().slice(0,100)||'Untitled exploration';}));
  el.objName.addEventListener('change',()=>mutate(()=>{const o=currentShape();if(o)o.name=el.objName.value.trim().slice(0,70)||'Object';}));
  for(const kind of ['position','rotation','scale']){
    $(`transform-${kind}`).addEventListener('change',e=>{
      const input=e.target.closest('input[data-transform]');if(!input)return;
      const index=Number(input.dataset.index),number=Number(input.value);
      if(!Number.isFinite(number)){renderInspector();return;}
      mutate(()=>{
        const obj=currentShape();if(!obj)return;
        obj[kind][index]=kind==='rotation'?Math.min(Math.PI*2,Math.max(-Math.PI*2,radians(number))):kind==='scale'?Math.max(.05,Math.min(40,number)):Math.max(-100,Math.min(100,number));
      });
    });
  }
  el.colors.addEventListener('click',e=>{
    const btn=e.target.closest('[data-color]');if(btn)mutate(()=>{const obj=currentShape();if(obj)obj.color=btn.dataset.color;});
  });
  el.customColor.addEventListener('change',()=>mutate(()=>{const obj=currentShape();if(obj)obj.color=el.customColor.value;}));
  el.metal.addEventListener('change',()=>mutate(()=>{const obj=currentShape();if(obj)obj.metalness=Number(el.metal.value)/100;}));
  el.rough.addEventListener('change',()=>mutate(()=>{const obj=currentShape();if(obj)obj.roughness=Number(el.rough.value)/100;}));
  el.metal.addEventListener('input',()=>{el.metalValue.textContent=el.metal.value+'%';});
  el.rough.addEventListener('input',()=>{el.roughValue.textContent=el.rough.value+'%';});
  el.undo.addEventListener('click',undo);el.redo.addEventListener('click',redo);
  $('btn-quick-build').addEventListener('click',runQuickBuild);
  el.quickCommand.addEventListener('keydown',e=>{if(e.key==='Enter')runQuickBuild();});
  $('btn-new').addEventListener('click',()=>{
    if(project.objects.length && !confirm('Create a new blank scene? Your current project is saved locally, but the editor will replace it. Export a JSON backup if you want to keep it.'))return;
    selectedId=null;mutate(()=>{project=emptyProject();});resetCamera();toast('New blank scene created');
  });
  $('btn-import').addEventListener('click',()=>el.fileInput.click());
  el.fileInput.addEventListener('change',async()=>{
    const file=el.fileInput.files?.[0];if(!file)return;
    try{
      if(file.size>2_000_000)throw new Error('Project file exceeds 2 MB');
      const loaded=normalizeProject(JSON.parse(await file.text()));
      selectedId=null;mutate(()=>{project=loaded;});frameAll();toast(`Loaded ${project.objects.length} objects`);
    }catch(err){toast(err.message||'Could not open project','error');}
    finally{el.fileInput.value='';}
  });
  $('btn-export').addEventListener('click',e=>{
    e.stopPropagation();el.exportMenu.classList.toggle('hidden');$('btn-export').setAttribute('aria-expanded',!el.exportMenu.classList.contains('hidden'));
  });
  el.exportMenu.addEventListener('click',e=>{const button=e.target.closest('[data-export]');if(button)exportAs(button.dataset.export);});
  document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap'))el.exportMenu.classList.add('hidden');});
  window.addEventListener('keydown',e=>{
    const typing=['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
    const cmd=e.ctrlKey||e.metaKey;
    if(cmd&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}
    if(cmd&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}
    if(typing)return;
    if(e.shiftKey&&e.key.toLowerCase()==='d'){e.preventDefault();duplicateSelected();return;}
    if(e.key==='Delete'||e.key==='Backspace'){deleteSelected();return;}
    if(e.key==='1')setMode('translate');if(e.key==='2')setMode('rotate');if(e.key==='3')setMode('scale');
    if(e.key.toLowerCase()==='f')focusSelected();
    if(e.key==='Escape'){select(null);el.exportMenu.classList.add('hidden');}
    if(e.key==='/'){e.preventDefault();el.quickCommand.focus();}
  });
}
function runQuickBuild(){
  const text=el.quickCommand.value.trim();if(!text){toast('Try “create a red chair”');return;}
  const parsed=parseQuickBuild(text);
  if(!parsed){toast('Supported: chair, lamp, rocket, table, podium and basic shapes. Try “blue sphere”.','error');return;}
  if(parsed.kind==='preset')buildPreset(parsed.value,parsed.color);
  else{
    const shape=mutate(()=>addShape(project,parsed.value,{color:parsed.color}));
    if(shape){select(shape.id);toast(`${shape.name} added`);}
  }
  el.quickCommand.value='';
}
installHandlers();
try{setupThree();}catch(err){console.error('FormForge renderer error',err);el.webglError.classList.remove('hidden');el.rendererState.textContent='NO WEBGL';toast('3D renderer failed to start','error');}
