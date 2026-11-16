#!/usr/bin/env bash
# Master the mix (limiter -> ~-14 LUFS) and mux it with the rendered frames into the final MP4.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
ffmpeg -v error -y -i build/mix.wav \
  -af "alimiter=level_in=1.72:limit=0.89:attack=3:release=80:asc=1:level=0,volume=-0.3dB" \
  -c:a pcm_f32le build/mix_master.wav
ffmpeg -v error -y -i build/video_noaudio.mp4 -i build/mix_master.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  "out/The Weird History of Ancient Medicine (4K).mp4"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "out/The Weird History of Ancient Medicine (4K).mp4"
