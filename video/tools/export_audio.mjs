// Dump the SFX cue list, music moods and dialogue spans from the timeline to data/audio_cues.json
import { chromium } from 'playwright';
import fs from 'fs';
import { serve } from './server.mjs';
const srv = await serve(0); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await p.goto(`http://127.0.0.1:${port}/web/index.html`);
await p.waitForFunction('window.ready', null, { timeout: 120000 });
const a = await p.evaluate(() => window.TL_AUDIO);
a.sfx.sort((x, y) => x.t - y.t);
fs.writeFileSync(new URL('../data/audio_cues.json', import.meta.url), JSON.stringify(a, null, 0));
const ids = {}; a.sfx.forEach(s => ids[s.id] = (ids[s.id] || 0) + 1);
console.log('sfx cues', a.sfx.length, 'distinct', Object.keys(ids).length); console.log(JSON.stringify(ids)); console.log('moods', JSON.stringify([...new Set(a.music.map(m => m.mood))]));
await b.close(); srv.close();
