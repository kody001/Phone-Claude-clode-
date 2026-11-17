// tiny static server rooted at video/
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
module.exports = function serve(port = 0) {
  return new Promise(res => { const s = http.createServer((req, rsp) => { const p = path.join(root, decodeURIComponent(req.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { rsp.writeHead(404); rsp.end(); return; } rsp.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rsp.end(d); }); }); s.listen(port, '127.0.0.1', () => res(s)); });
};
if (require.main === module) module.exports(8123).then(() => console.log('serving on 8123'));
