# What If You Got Sick in the Ancient World? — stickman video

A 2D hand-drawn stickman explainer built as HTML/JS canvas scenes and rendered to a 1920×1080, 60 fps MP4.
Narration comes from the supplied voiceover; captions are word-synced to it.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Loads the engine + scenes. Open it through a local server to preview with audio (`node render/serve.js`, then `http://127.0.0.1:8123/`). |
| `src/core.js` | Timeline, shots, camera (push-ins, punches, shakes), transitions, captions, sound-cue collection. |
| `src/draw.js`, `chars.js`, `props.js`, `bgs.js` | Hand-drawn (line-boil) primitives, character rig, props, painted backgrounds and maps. |
| `src/scenes0-4.js` | Shot list for the whole script (helpers, cold open + Egypt, Babylon, Greece, Rome + ending). |
| `tools/prep.py` | Turns the forced alignment into `data/words.js` (word timings), `timeline.json` (title/chapter pauses) and the lip-sync envelope. |
| `audio/` | `sfx.py` synthesized sound effects, `music.py` original score, `mix.py` voices + ambience + music + SFX mix. |
| `render/` | `validate.js` (checks every shot, exports sound cues), `still.js` (frames), `render.js` (parallel MP4 render), `finalize.sh` (master + mux). |

`input/` (voiceover + alignment), `build/` and `out/` are not committed.

## Rebuild

```bash
python3 tools/prep.py                                         # timings (needs input/vo.mp3 + input/align.json)
node render/validate.js --cues=build/cues.json --shots=build/shots.json
python3 audio/mix.py                                           # -> build/mix.wav
node render/render.js --workers=4                              # -> build/video_noaudio.mp4 (~40 min)
bash render/finalize.sh                                        # -> out/What If You Got Sick in the Ancient World.mp4
```

Requirements: Node + `puppeteer-core`, Google Chrome, ffmpeg, Python 3 with numpy/scipy/soundfile, rubberband.
The word alignment was made with `echogarden align` (DTW engine).
