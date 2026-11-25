// Minimal static file server rooted at the video/ directory.
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const TYPES = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.css':'text/css'};
export function serve(port = 0) {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, {'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream'});
      fs.createReadStream(p).pipe(r);
    }).listen(port, '127.0.0.1', () => res(srv));
  });
}
