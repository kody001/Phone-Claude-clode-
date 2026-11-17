#!/bin/bash
# Re-time the whole video to a recorded voice-over and re-render.
# usage: tools/rebuild_with_vo.sh path/to/voiceover.(wav|mp3|m4a)
set -e
cd "$(dirname "$0")/.."
python3 tools/align_vo.py "$1"          # -> data/timing.json + audio/vo.wav
node tools/export.js                     # -> data/shots.json + data/cues.json (shots follow the new timing)
python3 tools/music.py                   # score sections re-fitted to the new line timings
python3 tools/mix.py                     # -> audio/mix.wav (-14 LUFS)
rm -rf out/chunks && node tools/render.js --workers 3 --chunk 1800
tools/assemble.sh out/goldcrest_what_if.mp4
