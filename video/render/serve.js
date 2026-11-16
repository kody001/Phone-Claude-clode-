// Tiny static file server for the video folder (fonts and scripts load reliably over http).
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.mjs': 'text/javascript', '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.mjs': 'text/javascript' };
function serve(port = 0) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      // vendor libraries live in the repository's node_modules
      const VENDOR = { '/vendor/three.module.js': path.join(ROOT, '..', 'node_modules', 'three', 'build', 'three.module.js') };
      if (VENDOR[u]) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return fs.createReadStream(VENDOR[u]).pipe(res); }
      const p = path.join(ROOT, u);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}
module.exports = { serve, ROOT };
if (require.main === module) serve(+process.argv[2] || 8123).then(({ port }) => console.log('serving on http://127.0.0.1:' + port));
