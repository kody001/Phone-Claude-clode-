# AI data centers and your electric bill: 2D stickman finance video

A hand-drawn stickman explainer built entirely from HTML/JS canvas scenes and rendered to a
1920x1080, 60 fps MP4. The only audio is the supplied voice-over (no music, no sound effects).

- **Host:** the channel's Elon mascot (cartoon head, black suit, stick limbs) rigged with posable arms
  (pointing, pointer stick, shrug, think, facepalm, wave, hold props...), walking legs, blinking,
  20+ facial expressions and lip-flap driven by the voice-over's loudness.
- **Supporting cast:** about 30 unique hand-drawn stickmen (`scenes/js/cast.js`).
- **Style:** white background, flat doodle props with wobbly ink outlines, article/chart cards with
  animated highlighter, red scribble circles, stamps, quick cuts (294 shots), word-highlighted captions.

## Pipeline
| step | command | output |
|---|---|---|
| transcribe voice-over (word timings) | `python3 tools/transcribe.py audio/voiceover.mp3 --models <dir>` | `data/transcript.json` |
| caption corrections | `python3 tools/fix_transcript.py` | `data/words.json`, `scenes/data/words.js` |
| lip-sync envelope | `python3 tools/envelope.py` | `scenes/data/env.js` |
| preview in a browser | `node tools/serve.js` then open the printed URL | live player with scrubber |
| contact sheets for review | `node tools/sheets.js /tmp/sheets [fromShot] [toShot]` | 4x3 JPEG sheets |
| render | `node tools/render.js --workers 3` | `out/chunks/*.mp4` (resumable) |
| assemble with voice-over | `tools/assemble.sh` | `out/ai_data_centers_electric_bill.mp4` |

Transcription models (sherpa-onnx zipformer + Whisper small.en) come from the k2-fsa/sherpa-onnx
GitHub releases; they are not committed.

## Scene code
- `scenes/js/shots1.js` ... `shots4.js`: the shot list. Each `shot('phrase', [...])` starts on that
  phrase of the voice-over, and every element can pop in on a later phrase (`at: 'phrase'`), so the
  edit stays locked to the narration.
- `characters.js`: mascot + stickman rigs, poses (IK arms), expressions. `cast.js`: character looks.
- `props.js`, `shotkit.js`: doodle props and helpers. `cards.js`: article cards, charts, polls,
  chalkboard, bubbles, arrows, circles, timelines. `timeline.js`: anchors, animation, captions, camera.
