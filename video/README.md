# What If You Were the ONLY Poor Kid at a Billionaires-Only School? — animated video

Everything is generated from code: three.js scenes rendered headlessly at 1920×1080 / 60 fps,
an original FluidSynth score, a procedural sound-effects library and an automatic mix.

## Pipeline
| step | command | output |
|---|---|---|
| parse script | `python3 tools/parse_script.py` | `data/script.json` |
| narration timing | `python3 tools/tts_standin.py` (temporary voice) **or** `python3 tools/align_vo.py my_vo.wav` (real voice-over) | `data/timing.json`, `audio/vo.wav` |
| shots → cue sheet | `node tools/export.js` | `data/shots.json`, `data/cues.json` |
| voice clips for crowds/laughs | `python3 tools/voices.py` | `audio/voicepool/` |
| sound effects | `python3 tools/sfx.py` | `audio/sfx/*.wav` |
| score | `python3 tools/music.py` | `audio/music/*.wav`, `data/music_cues.json` |
| mix | `python3 tools/mix.py` | `audio/mix.wav` (-14 LUFS, -1 dBTP) |
| render | `node tools/render.js --workers 3` | `out/chunks/*.mp4` (resumable) |
| assemble | `tools/assemble.sh` | `out/goldcrest_what_if.mp4` |

`tools/rebuild_with_vo.sh my_vo.wav` runs the whole chain for a recorded voice-over.

## Scene code
- `scenes/js/shots1.js`, `shots2.js`, `shots3.js` — the 215 shots, anchored to words in the script
  (e.g. `'L17:deliveries'` = the word "Deliveries" in line 17), so shots and sound cues follow any voice timing.
- `character.js` / `faces.js` — toy-style characters with expressions, lip flap, poses.
- `sets.js`, `props.js`, `kit.js` — environments and props. `overlay.js`, `phone.js` — captions, bubbles, UI.
- Preview a frame: `node tools/snap.js /tmp/out 600 1200` (frame numbers at 60 fps).
