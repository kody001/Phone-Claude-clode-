#!/usr/bin/env bash
# Concatenate rendered chunks, master the audio (-14 LUFS, -1 dBTP) and mux the final MP4.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-render/final.mp4}
ls render/chunks/c*.mp4 | grep -v part | sort | sed "s|^|file '$PWD/|; s|$|'|" > render/list.txt
ffmpeg -hide_banner -nostats -y -i audio/out/mix_premaster.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2> render/loudnorm.json || true
read -r MI MTP MLRA MTH MOFF < <(python3 - <<'PY'
import json,re
t=open('render/loudnorm.json').read(); j=json.loads(t[t.index('{'):t.rindex('}')+1])
print(j['input_i'], j['input_tp'], j['input_lra'], j['input_thresh'], j['target_offset'])
PY
)
ffmpeg -v error -y -i audio/out/mix_premaster.wav -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTH:offset=$MOFF:linear=true,aresample=48000" -c:a pcm_s24le render/master.wav
ffmpeg -v error -y -f concat -safe 0 -i render/list.txt -i render/master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
