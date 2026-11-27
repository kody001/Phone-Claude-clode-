# Why Millions Of Homeowners Can't Afford To Move

2D stick-figure finance video (1920x1080, 60 fps) built as HTML/JS canvas scenes.

- `script.txt` – the voiceover script
- `assets/voiceover.mp3` – the voiceover (the only audio track: no SFX, no music)
- `assets/mascot/` – channel mascot cut from the supplied image (`original.jpg`); `head.png`/`torso.png` are the
  original pixels with the blue background removed, `rig.json` holds anchor points for limbs and face
- `build/words.json` – word-level timings from forced alignment (`tools/align.py`, PocketSphinx)
- `web/` – the scenes: `index.html` previews the video in a browser with the audio (serve the folder over http)
  - `js/mascot.js` mascot rig (poses, pointer stick, expressions), `js/stick.js` hand-drawn extras,
    `js/props.js` props, `js/ui.js` cards/charts, `js/captions.js` word-synced captions,
    `js/story*.js` the storyboard (each shot starts on a spoken phrase)
- `render/render.mjs` – renders to MP4 with headless Chromium + ffmpeg:
  `node render/render.mjs --out=out --workers=4`
