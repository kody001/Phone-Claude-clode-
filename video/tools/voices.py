"""Voice-based sound assets (walla, laughs, gasps, phone voice...) rendered with the local Kokoro model."""
import json, pathlib, random, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
from pedalboard import Pedalboard, PitchShift
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'voicepool'; OUT.mkdir(parents=True, exist_ok=True)
kok = Kokoro(str(ROOT / 'models/kokoro-v1.0.onnx'), str(ROOT / 'models/voices-v1.0.bin'))
KIDS = ['af_bella', 'af_nicole', 'af_sky', 'af_sarah', 'af_nova', 'af_river', 'am_puck', 'am_liam', 'am_echo', 'bf_emma', 'bf_isabella', 'bf_lily', 'am_adam', 'am_eric']
ADULT = ['am_michael', 'am_onyx', 'am_fenrir', 'af_heart', 'af_bella', 'bm_george', 'bm_lewis', 'af_sarah']

def tts(text, voice, speed=1.0, kid=False, semis=None):
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    a, sr = kok.create(text, voice=voice, speed=speed, lang=lang)
    a = a.astype(np.float32)
    if kid:
        s = semis if semis is not None else (4.0 if voice.startswith(('af', 'bf')) else 5.5)
        a = Pedalboard([PitchShift(semitones=s)])(a[None, :], sr)[0]
    a = resample_poly(a, 2, 1).astype(np.float32)  # 24k -> 48k
    idx = np.where(np.abs(a) > 0.01)[0]
    if len(idx): a = a[max(0, idx[0] - 480): idx[-1] + 2400]
    return a / max(1e-6, np.abs(a).max()) * 0.9

def save(name, a): sf.write(OUT / f'{name}.wav', a, 48000, subtype='PCM_16')

jobs = []
WALLA = ["did you see that", "no way, seriously", "my dad just bought another jet", "pass the truffle fries", "that is so funny", "we're going to Paris this weekend",
         "wait, what did he say", "I love this place", "okay, okay, listen", "are you coming to the party", "oh my gosh", "that's literally insane", "my horse is named Duchess",
         "I forgot my credit card", "did you finish the essay", "it's so good", "can you believe it", "the chef remembered my name", "let's sit over there", "ha, that's hilarious"]
for i, p in enumerate(WALLA):
    for v in random.Random(i).sample(KIDS, 4): jobs.append((f'walla_{i:02d}_{v}', p, v, 1.05, True))
LAUGHS = ["Ha ha ha ha!", "Hahaha!", "Ha! Ha ha ha.", "Hehehe!", "Ha ha, oh my gosh!", "Hahahaha!", "Heh heh heh!"]
for i, p in enumerate(LAUGHS):
    for v in KIDS[:10]: jobs.append((f'laugh_{i}_{v}', p, v, 1.1, True))
for i, p in enumerate(["Ooh!", "Whoa!", "Oh!", "Ohhh!", "Huh?!"]):
    for v in KIDS[:10]: jobs.append((f'gasp_{i}_{v}', p, v, 1.0, True))
for i, p in enumerate(["Yay!", "Woo hoo!", "Yes!", "Wooo!"]):
    for v in KIDS[:8]: jobs.append((f'cheer_{i}_{v}', p, v, 1.0, True))
for i, p in enumerate(["Heh heh.", "Pfft, heh.", "Hm hm hm."]):
    for v in KIDS[:8]: jobs.append((f'snicker_{i}_{v}', p, v, 1.0, True))
jobs += [('chatter_bro', "Do you have a pool? Is it big? Do you have a dog? Do you have two dogs? Can I come over? What's your favorite cereal?", 'am_puck', 1.25, True),
         ('giggle_bro', "Hee hee hee hee!", 'am_puck', 1.1, True),
         ('fake_laugh', "Ha. Ha. Ha. Yeah.", 'am_liam', 0.9, True),
         ('mom_laugh', "Hahaha! Oh my gosh, ha ha ha!", 'af_heart', 1.0, False),
         ('dad_laugh', "Ha ha ha ha!", 'am_onyx', 1.0, False),
         ('dad_laugh2', "Ho ho ho, ha ha!", 'am_michael', 1.0, False),
         ('video_msg_dad', "Happy birthday, champ!", 'am_michael', 1.0, False),
         ('video_msg_mom', "We love you, sweetie! Sorry we can't be there.", 'af_bella', 1.0, False),
         ('nature_doc', "And here... we observe the rare sandwich eater... in its natural habitat.", 'bm_george', 0.92, False),
         ('yawn', "Aaaaaahhh... hmmm.", 'am_liam', 0.7, True),
         ('yawn2', "Hhaaaaahh... mm.", 'af_sky', 0.7, True),
         ('sigh', "Phewww.", 'am_liam', 0.8, True),
         ('sniffle_v', "hnf.", 'af_heart', 1.0, False),
         ('whisper_src', "psst... did you hear? he takes the bus.", 'af_nicole', 1.0, True),
         ('kid_cheer_bro', "Yeah! Woo!", 'am_puck', 1.0, True)]
print(len(jobs), 'voice clips', flush=True)
for n, (name, text, v, sp, kid) in enumerate(jobs):
    if (OUT / f'{name}.wav').exists(): continue
    try: save(name, tts(text, v, sp, kid))
    except Exception as e: print('fail', name, e, flush=True)
    if n % 40 == 0: print(n, flush=True)
print('done', flush=True)
