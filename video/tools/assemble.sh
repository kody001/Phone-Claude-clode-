#!/bin/bash
# Concatenate rendered chunks and mux the final audio mix.
set -e
cd "$(dirname "$0")/.."
OUT=${1:-out/goldcrest_what_if.mp4}
ls out/chunks/c_*.mp4 | grep -v part | sort | sed "s|^|file '$(pwd)/|; s|$|'|" > out/chunks/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_only.mp4
ffmpeg -y -loglevel error -i out/video_only.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
