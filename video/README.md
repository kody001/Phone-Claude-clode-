# The SpaceX IPO Was Never About Space — 2D stickman finance video

Everything is drawn in code as HTML/JS canvas scenes and rendered to MP4
(1920x1080, 16:9, 60 fps). The only audio is the supplied voice-over: no
music, no sound effects.

## Layout

| Path | What it is |
| --- | --- |
| `../script/spacex-ipo-script.txt` | Narration script (delivery tags like `[awe]` are not spoken or shown) |
| `assets/elon_original.jpg` | Channel mascot, as supplied |
| `assets/cut_elon.py` | Cuts the mascot's head + suit out of the image unchanged; arms and legs are redrawn as movable limbs |
| `align/` | Forced alignment of the voice-over to the script (word timings) and caption building |
| `web/engine.js` | Renderer: mascot rig (poses, hand gestures, facial expressions, blinking), stickman characters, hand-drawn primitives, captions |
| `web/props.js` | Hand-drawn prop library (rockets, money, charts, documents, chips, buildings, ...) |
| `web/kit.js` | Animation helpers (draw-on arrows, highlighter, counters, bar/line/pie charts, stamps) |
| `web/scenes1-4.js` | The shot list, keyed to words in the narration |
| `tools/render.js` | Parallel headless-Chromium renderer that pipes frames to ffmpeg |
| `tools/preview.js` | Renders contact sheets of chosen timestamps |

## Re-render

```bash
cd video/tools
node render.js --workers 4 --preset fast --crf 18 --out ../out
cd ../out
ffmpeg -f concat -safe 0 -i segs.txt -i <voiceover.mp3> -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart spacex_ipo_video.mp4
```

Preview frames while editing scenes:

```bash
node tools/preview.js /tmp/sheet.jpg 12.5 40 300
```

## Re-aligning a new voice-over

```bash
cd video/align
ffmpeg -i voiceover.mp3 -ac 1 -ar 16000 -f s16le vo16k.raw
python3 tokenize_script.py ../../script/spacex-ipo-script.txt tokens.json
python3 align_chunks.py          # pocketsphinx forced alignment -> words_aligned.json
python3 build_timeline.py        # -> timeline.json (copy into web/)
```
