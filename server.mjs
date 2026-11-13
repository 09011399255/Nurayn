import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4175);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf', '.json':'application/json', '.md':'text/plain; charset=utf-8' };
http.createServer(async (req,res) => {
  try {
    const requested = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    if (!target.startsWith(root + path.sep) || !(await stat(target)).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type':types[path.extname(target)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(await readFile(target));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port,'127.0.0.1',() => console.log(`Local: http://127.0.0.1:${port}/`));
