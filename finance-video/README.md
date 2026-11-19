# AI data centers and your electric bill: 2D stickman finance video

A hand-drawn stickman explainer built entirely from HTML/JS canvas scenes and rendered to a
1920x1080, 60 fps MP4. The only audio is the supplied voice-over (no music, no sound effects).

- **Host:** the channel's Elon mascot, using the creator's exact image (`assets/mascot_ref.jpg`).
  `tools/cut_mascot.py` only removes the blue background; head, face, hair and suit stay one
  untouched picture. The image's own stick arms and legs are separate pieces that swing at the
  shoulders and hips (pointing, pointer stick, shrug, raised hand, wave, walking). The face is never
  edited, so feelings are shown with body language and symbols beside the head (!, ?, sweat, cloud, sparkles).
- **Supporting cast:** about 30 unique hand-drawn stickmen (`scenes/js/cast.js`).
- **Style:** white background, flat doodle props with wobbly ink outlines, article/chart cards with
  animated highlighter, red scribble circles, stamps, quick cuts (294 shots), word-highlighted captions.

## Pipeline
| step | command | output |
|---|---|---|
| cut the mascot image into puppet pieces | `python3 tools/cut_mascot.py assets/mascot_ref.jpg` | `assets/mascot/*.png`, `scenes/data/mascot.js` |
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
- `mascot.js`: the image-based mascot puppet. `characters.js`: stickman rigs, poses (IK arms),
  expressions. `cast.js`: character looks.
- `props.js`, `shotkit.js`: doodle props and helpers. `cards.js`: article cards, charts, polls,
  chalkboard, bubbles, arrows, circles, timelines. `timeline.js`: anchors, animation, captions, camera.
