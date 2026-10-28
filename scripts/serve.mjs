import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 5173);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end();return; }
  const file = path.resolve(root, '.' + (pathname === '/'?'/index.html':pathname));
  if (!file.startsWith(root + path.sep) && file !== path.join(root,'index.html')) { res.writeHead(403).end();return; }
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'}).end(data);
  });
}).listen(port,'0.0.0.0',()=>console.log(`FormForge Studio: http://localhost:${port}`));
