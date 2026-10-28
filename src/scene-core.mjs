/** Pure, browser-agnostic project model. Used by the editor and Node tests. */
export const PROJECT_VERSION = 1;
export const MAX_OBJECTS = 200;
export const TYPES = ['box', 'sphere', 'cylinder', 'cone', 'torus'];
export const PALETTE = ['#98a7ff', '#f59e76', '#8fe3b1', '#e6c982', '#cfadf7', '#9ae3e4', '#f1f1f5', '#303849'];

const DEFAULTS = {
  box: { name: 'Cube', color: PALETTE[0] },
  sphere: { name: 'Sphere', color: PALETTE[4] },
  cylinder: { name: 'Cylinder', color: PALETTE[2] },
  cone: { name: 'Cone', color: PALETTE[1] },
  torus: { name: 'Torus', color: PALETTE[3] },
};

const clamp = (v, min, max, fallback) => Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback;
const cleanText = (v, fallback, max = 70) => typeof v === 'string' ? (v.trim().slice(0, max) || fallback) : fallback;
export const validColor = v => /^#[0-9a-f]{6}$/i.test(v) ? v : PALETTE[0];
const vector = (v, fallback, min = -100, max = 100) => [0,1,2].map(i => clamp(Array.isArray(v) ? v[i] : undefined, min, max, fallback[i]));

export function makeObject(id, type = 'box', custom = {}) {
  if (!TYPES.includes(type)) throw new Error(`Unknown geometry: ${type}`);
  const defaults = DEFAULTS[type];
  return {
    id: String(id), type,
    name: cleanText(custom.name, defaults.name),
    position: vector(custom.position, [0, 0.5, 0]),
    rotation: vector(custom.rotation, [0, 0, 0], -Math.PI * 2, Math.PI * 2),
    scale: vector(custom.scale, [1, 1, 1], 0.05, 40),
    color: validColor(custom.color ?? defaults.color),
    metalness: clamp(custom.metalness, 0, 1, 0.2),
    roughness: clamp(custom.roughness, 0, 1, 0.45),
    visible: custom.visible !== false,
  };
}

export function emptyProject(name = 'Untitled exploration') {
  return { version: PROJECT_VERSION, name, counter: 1, objects: [] };
}

export function addShape(project, type = 'box', overrides = {}) {
  if (project.objects.length >= MAX_OBJECTS) throw new Error(`A scene can have at most ${MAX_OBJECTS} objects.`);
  const id = `shape-${project.counter++}`;
  const shape = makeObject(id, type, overrides);
  project.objects.push(shape);
  return shape;
}

export function duplicateShape(project, id) {
  const source = project.objects.find(o => o.id === id);
  if (!source) return null;
  const copy = addShape(project, source.type, { ...source, name: `${source.name} copy`, position: source.position.map((n, i) => n + (i === 0 ? 0.7 : 0)) });
  return copy;
}

export function normalizeProject(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.objects)) throw new Error('The file is not a FormForge project.');
  if (raw.objects.length > MAX_OBJECTS) throw new Error('This project contains too many objects.');
  const result = emptyProject(cleanText(raw.name, 'Imported scene', 100));
  const used = new Set();
  for (const item of raw.objects) {
    if (!item || !TYPES.includes(item.type)) continue;
    let id = cleanText(item.id, `shape-${result.counter}`);
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) id = `shape-${result.counter}`;
    while (used.has(id)) id = `shape-${++result.counter}`;
    used.add(id);
    result.objects.push(makeObject(id, item.type, item));
    result.counter++;
  }
  const numericIds = result.objects.map(o => Number(o.id.match(/^shape-(\d+)$/)?.[1] || 0));
  result.counter = Math.max(result.counter, ...numericIds.map(n => n + 1), 1);
  return result;
}

export function snapshot(project) { return JSON.stringify(project); }
export function restore(json) { return normalizeProject(JSON.parse(json)); }

export function newDemoProject() {
  const p = emptyProject('Studio study 01');
  addPreset(p, 'podium');
  return p;
}

const add = (p, type, name, position, scale, color, rotation=[0,0,0], metalness=0.2, roughness=0.45) =>
  addShape(p, type, { name, position, scale, color, rotation, metalness, roughness });

export function addPreset(p, which, colorOverride) {
  const c = colorOverride && validColor(colorOverride);
  const base = p.objects.length ? [Math.min(9, Math.floor(p.objects.length / 3) * 2), 0, 0] : [0,0,0];
  const x = base[0];
  const items = [];
  const push = (...args) => items.push(add(p, ...args));
  const ensure = count => { if (p.objects.length + count > MAX_OBJECTS) throw new Error('Too many shapes for this preset.'); };
  if (which === 'podium') {
    ensure(4);
    push('cylinder','Pedestal • base',[x,0.18,0],[2.4,0.34,2.4],'#343b58',[0,0,0],0.65,0.28);
    push('cylinder','Pedestal • lip',[x,0.42,0],[2.1,0.16,2.1],'#7c88ae',[0,0,0],0.8,0.2);
    push('torus','Halo ring',[x,2.35,0],[0.95,0.95,0.28],c || '#baa8ff',[Math.PI/2,0,0],0.52,0.26);
    push('sphere','Hero object',[x,1.38,0],[1.25,1.25,1.25],c || '#a6b1ff',[0,0,0],0.4,0.23);
  } else if (which === 'lamp') {
    ensure(4);
    push('cylinder','Lamp • foot',[x,0.11,0],[1.5,0.22,1.5],'#50566b',[0,0,0],0.8,0.23);
    push('cylinder','Lamp • pole',[x,1.32,0],[0.16,2.3,0.16],'#d6d9e7',[0,0,0],0.9,0.18);
    push('cone','Lamp • shade',[x,2.62,0],[1.35,1.2,1.35],c || '#e0b8a0',[Math.PI,0,0],0.05,0.55);
    push('sphere','Lamp • bulb',[x,2.12,0],[0.38,0.38,0.38],'#ffefbf',[0,0,0],0.05,0.25);
  } else if (which === 'chair') {
    ensure(6);
    push('box','Chair • seat',[x,1.0,0],[1.8,0.24,1.65],c || '#9d9bdf');
    push('box','Chair • back',[x,1.9,-0.72],[1.8,1.9,0.18],c || '#9d9bdf');
    for (const side of [-0.67,0.67]) for (const depth of [-0.56,0.56])
      push('cylinder','Chair • leg',[x+side,0.5,depth],[0.15,0.95,0.15],'#c8bca6',[0,0,0],0.34,0.48);
  } else if (which === 'rocket') {
    ensure(6);
    push('cylinder','Rocket • body',[x,1.55,0],[1.0,2.5,1.0],c || '#dbe0f9',[0,0,0],0.36,0.33);
    push('cone','Rocket • nose',[x,3.15,0],[1.02,1.2,1.02],'#ef8a72',[0,0,0],0.18,0.48);
    push('cylinder','Rocket • window',[x,2.0,0.5],[0.53,0.12,0.53],'#8dc6e6',[Math.PI/2,0,0],0.63,0.2);
    for (const [angle,dx,dz] of [[0,0,0.58],[2.094,0.5,-0.29],[4.188,-0.5,-0.29]])
      push('box','Rocket • fin',[x+dx,0.66,dz],[0.16,1.0,0.65],'#ef8a72',[0,angle,0],0.2,0.42);
  } else if (which === 'table') {
    ensure(5);
    push('box','Table • surface',[x,1.55,0],[2.9,0.22,1.7],c || '#c99d71',[0,0,0],0.08,0.56);
    for (const side of [-1.15,1.15]) for (const depth of [-0.60,0.60])
      push('cylinder','Table • leg',[x+side,0.76,depth],[0.17,1.5,0.17],'#54556b',[0,0,0],0.56,0.36);
  } else throw new Error('Unknown preset.');
  return items;
}

const TEXT_COLORS = {
  red: '#ec776d', blue: '#6e9dff', green: '#7ad7a0', yellow: '#f4d17f', purple: '#b89af8',
  pink: '#f29cc6', orange: '#f6a06e', black: '#3c4154', white: '#e7e9f6', gold: '#e5bf75', silver: '#cbd2dd'
};

/** Deliberately rule-based: not an LLM, no API key or cloud charges. */
export function parseQuickBuild(command) {
  const words = String(command || '').toLowerCase().match(/[a-z]+/g) || [];
  const preset = ['chair','lamp','rocket','table','podium'].find(x => words.includes(x));
  const primitive = [['cube','box'],['box','box'],['sphere','sphere'],['ball','sphere'],['cylinder','cylinder'],['cone','cone'],['torus','torus'],['ring','torus']].find(([key]) => words.includes(key))?.[1];
  const color = Object.keys(TEXT_COLORS).find(c => words.includes(c));
  if (preset) return { kind:'preset', value:preset, color: color ? TEXT_COLORS[color] : undefined };
  if (primitive) return { kind:'shape', value:primitive, color: color ? TEXT_COLORS[color] : undefined };
  return null;
}
