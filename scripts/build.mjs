import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFile(new URL(name, new URL('../', import.meta.url)), 'utf8');
const result = await build({
  absWorkingDir: root, entryPoints: ['src/main.js'], bundle: true,
  write: false, format: 'iife', minify: true, legalComments: 'inline', target: 'chrome110',
});
const [shell, css, bootstrap, license] = await Promise.all([
  read('index.html'), read('src/styles.css'), read('src/bootstrap.js'), read('node_modules/three/LICENSE'),
]);
const script = text => `<script>${text.replace(/<\/script/gi, '<\\/script')}</script>`;
const html = shell
  .replace(/<link rel="stylesheet"[^>]+>/, () => `<style>${css}</style>`)
  .replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace('<script src="./src/bootstrap.js"></script>', () => script(bootstrap))
  .replace('<script type="module" src="./src/main.js"></script>', () => script(result.outputFiles[0].text))
  .replace('</head>', () => `<!-- Bundled Three.js license:\n${license}\n-->\n</head>`);
const output = new URL('../dist/', import.meta.url);
await fs.mkdir(output, {recursive: true});
await fs.writeFile(new URL('index.html', output), html);
await fs.writeFile(new URL('.nojekyll', output), '');
console.log(`Built dist/index.html (${Buffer.byteLength(html)} bytes)`);
