#!/usr/bin/env bash
# Join rendered chunks and add the voice-over as the ONLY audio track (no music, no SFX).
# usage: tools/assemble.sh [output.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-out/ai_data_centers_electric_bill.mp4}"
LIST=out/chunks/list.txt
: > "$LIST"
for f in out/chunks/c_*.mp4; do case "$f" in *.part.mp4) continue;; esac; echo "file '$PWD/$f'" >> "$LIST"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$LIST" -i audio/voiceover.mp3 \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
