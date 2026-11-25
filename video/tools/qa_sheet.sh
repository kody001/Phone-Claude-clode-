#!/usr/bin/env bash
# qa_sheet.sh <chunk_index...> : one frame every 2.5 s from each rendered chunk -> contact sheet(s) in scratch dir
S=/tmp/claude-0/-home-user-Phone-Claude-clode-/3cd97fe8-143f-518c-a46f-280da0a203f8/scratchpad/qa; mkdir -p $S; rm -f $S/q_*.png
i=0
for k in "$@"; do f=$(printf "render/chunks/c%04d.mp4" $k); for s in 0.5 3 5.5 8 10.5 13 15.5 18; do ffmpeg -v error -y -ss $s -i $f -frames:v 1 -vf scale=480:-1 $(printf "$S/q_%04d.png" $i); i=$((i+1)); done; done
ffmpeg -v error -y -i $S/q_%04d.png -vf tile=4x4 $S/sheet_%02d.png; ls $S/sheet_*.png
