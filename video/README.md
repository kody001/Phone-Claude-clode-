# Florida housing video (2D stickman finance explainer)

Hand-drawn style animation built as HTML/JS canvas scenes and rendered to a 1080p60 MP4.
Audio is the voiceover only, with no sound effects or music.

## Layout
- `script.txt`: the narration script (with delivery tags).
- `assets/voiceover.mp3`: the voiceover; `assets/mascot_original.jpg`: the channel mascot.
- `tools/cut_mascot.py`: cuts the mascot's head and torso out of the original art unchanged; the stick limbs are re-drawn so they can move.
- `tools/recognize.py` + `tools/align.py`: word timings (offline speech recognition matched against the script).
- `tools/envelope.py`: loudness envelope used for lip sync.
- `src/engine.js`: hand-drawn drawing engine and captions. `src/characters.js`: mascot rig and extra stickmen.
  `src/props.js`: props. `src/scenes.js`: shot framework. `src/shots.js`, `src/shots2.js`: the shot list.
- `index.html`: browser preview, synced to the voiceover. Run `tools/*.py` first to create `build/`.
- `src/render.js`: renders a frame range to H.264 via ffmpeg.

## Build
    pip install pocketsphinx num2words scipy numpy pillow
    npm install
    ffmpeg -i assets/voiceover.mp3 -ac 1 -ar 16000 build/vo16k.wav
    python3 tools/cut_mascot.py && python3 tools/recognize.py && python3 tools/align.py && python3 tools/envelope.py
    node src/render.js 0 66272 build/video.mp4
    ffmpeg -i build/video.mp4 -i assets/voiceover.mp3 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart final.mp4
