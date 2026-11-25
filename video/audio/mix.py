"""Final mix: voiceover (dominant) + procedural SFX + underscore, ducked under the voice.
Usage: python3 mix.py <vo.mp3> <cues.json> <out_dir>
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy import signal
sys.path.insert(0, os.path.dirname(__file__))
from dsp import SR, bp, lp, hp, noise, db, stereo
import sfx as SFXLIB
from music import render_score

vo_path, cue_path, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
cues = json.load(open(cue_path))
DUR = cues['duration']
N = int(DUR * SR)

# ------------------------------------------------------------------ voiceover
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
vo = np.vstack([vo, np.zeros((max(0, N - len(vo)), 2))])[:N]

# intercom treatment for the maintenance worker's lines ("muffled voice on the speaker")
mask = np.zeros(N)
for s in cues['speech']:
    if s['who'] == 'maint':
        a, b = int((s['s'] - 0.08) * SR), int((s['e'] + 0.15) * SR)
        mask[a:b] = 1
mask = signal.filtfilt(np.ones(int(0.03 * SR)) / int(0.03 * SR), [1], mask)
radio = bp(vo, 380, 3300, 4)
radio = np.tanh(radio * 2.2) / np.tanh(2.2) * db(3.0)
hiss = np.stack([bp(noise(DUR, 'white'), 1500, 6000, 2)] * 2, 1) * 0.004
vo = vo * (1 - mask[:, None] * 0.85) + (radio + hiss) * (mask[:, None] * 0.85)

# voice activity envelope (for ducking)
mono = np.abs(vo).mean(1)
win = int(0.05 * SR)
env = np.sqrt(np.maximum(signal.fftconvolve(mono ** 2, np.ones(win) / win, mode="same"), 0))
env_db = 20 * np.log10(env + 1e-9)
active = (env_db > np.percentile(env_db[env_db > -80], 30) - 4).astype(float)
def smooth_gate(x, att, rel):
    y = np.zeros_like(x); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR)); v = 0.0
    # decimate for speed
    step = 48; xs = x[::step]; ys = np.zeros_like(xs)
    a = np.exp(-step / (att * SR)); r = np.exp(-step / (rel * SR))
    for i, xv in enumerate(xs):
        c = a if xv > v else r; v = c * v + (1 - c) * xv; ys[i] = v
    return np.repeat(ys, step)[:len(x)]
vad = smooth_gate(active, 0.06, 0.45)

# ------------------------------------------------------------------ SFX bus
BASE = {  # dB, relative placement under the voice
    'tick': -27, 'soft_tick': -25, 'pop': -22, 'pop_word': -20, 'click': -22, 'flip': -24, 'counter_roll': -26,
    'step': -24, 'step_run': -22, 'step_stair': -24, 'stumble': -18, 'cloth': -24, 'breath_in': -26, 'breath_fast': -25, 'pant': -24, 'gasp': -20,
    'typing': -20, 'phone_typing': -22, 'scoot': -22, 'slide_wall': -22, 'sit_thud': -20, 'grab': -18,
    'amb_street': -24, 'cafeteria': -27, 'elev_hum': -25, 'crickets': -22, 'tinnitus': -30, 'flicker': -20, 'static': -22,
    'heartbeat': -15, 'impact_big': -9, 'sub_boom': -11, 'title_hit': -13, 'sting_shock': -15, 'sting_dun': -14, 'sting_low': -16, 'sting_soft': -19,
    'suspense_hit': -17, 'drone_hit': -18, 'riser': -18, 'riser_short': -19, 'riser_dark': -18, 'movie_boom': -14,
    'whoosh': -19, 'whoosh_small': -21, 'whoosh_big': -16, 'whoosh_low': -19, 'zoom_whoosh': -20, 'whoosh_hit': -15, 'ghost_whoosh': -18,
    'ding': -15, 'door_slide': -17, 'door_shut': -17, 'door_thunk': -13, 'door_push': -20, 'elev_start': -17, 'grind': -14, 'shudder': -14, 'rumble': -14,
    'button': -18, 'button_hard': -15, 'button_mash': -19, 'alarm_bell': -19, 'intercom_click': -16, 'fan_stop': -19,
    'stomach_growl': -11, 'stomach_growl2': -15, 'echo_growl': -17, 'whale': -14,
    'record_scratch': -14, 'sad_trombone': -18, 'fail_honk': -16, 'boing': -17, 'slide_down': -18, 'cartoon_stretch': -18, 'cartoon_shrink': -18,
    'blink': -19, 'sparkle': -19, 'chime_magic': -17, 'chime_soft': -19, 'harp_gliss': -18, 'crowd_gasp': -15, 'crowd_aww': -17,
    'phone_buzz': -15, 'msg_pop': -17, 'msg_send': -18, 'low_battery': -19, 'power_down': -15,
    'zipper': -17, 'wrapper': -18, 'snap': -16, 'crunch': -19, 'cardboard_crash': -13, 'guitar_bad': -15, 'guitar_bad2': -14, 'guitar_bad3': -14,
    'cat_yowl': -17, 'cat_meow': -19, 'game_jump': -19, 'game_over': -17, 'gameshow': -17, 'ding_correct': -18, 'clock_tick': -18, 'clock_tick_slow': -19,
    'clock_fast': -20, 'flatline': -22, 'computer_beeps': -21, 'error_buzz': -19, 'sad_drop': -18, 'lights_on': -19, 'rec_beep': -19, 'bell': -18,
    'cable_creak': -19, 'clamp': -14, 'wrench': -19, 'clock_chime': -20, 'floor_tick': -20,
}
HITS = {'impact_big', 'sub_boom', 'title_hit', 'sting_shock', 'sting_dun', 'record_scratch', 'stomach_growl', 'whale', 'cardboard_crash', 'movie_boom'}
sfx_bus = np.zeros((N + 10 * SR, 2))
cache = {}
for c in cues['sfx']:
    sid = c['id']; d = c.get('dur')
    key = (sid, round(d, 2) if d else None, len(cache) % 3 if sid in ('heartbeat', 'step', 'step_run', 'tick', 'pop', 'cloth') else 0)
    if key not in cache:
        cache[key] = SFXLIB.S[sid](d)
    y = cache[key] * db(BASE.get(sid, -18) + 2.0) * c.get("gain", 1.0)
    i = int(c['t'] * SR)
    if i >= N: continue
    n = min(len(y), len(sfx_bus) - i)
    duck = 1 - vad[i:i + n] * (0.35 if sid in HITS else 0.5) if i + n <= N else np.ones(n)
    if len(duck) < n: duck = np.concatenate([duck, np.ones(n - len(duck))])
    sfx_bus[i:i + n] += y[:n] * duck[:, None]
sfx_bus = sfx_bus[:N]

# ------------------------------------------------------------------ music bus
music = render_score(cues['music'], DUR)
music = np.vstack([music, np.zeros((max(0, N - len(music)), 2))])[:N]
# level: underscore sits ~20 dB under the voice during speech, ~13 dB under in gaps
vo_rms = np.sqrt(np.mean(vo[env_db > -40] ** 2)); mu_rms = np.sqrt(np.mean(music[np.abs(music).mean(1) > 1e-4] ** 2)) + 1e-9
music *= vo_rms / mu_rms * db(-10.5)
music *= (1 - 0.55 * vad)[:, None]  # sidechain duck ≈ -7 dB under speech
music = hp(music, 70, 2)
# carve a little room for the voice (presence dip in the underscore)
music = music - 0.35 * bp(music, 1200, 3500, 2)

# ------------------------------------------------------------------ master
mixed = vo + sfx_bus + music
tail = int(0.5 * SR)
sf.write(f'{out_dir}/stem_vo.wav', vo.astype(np.float32), SR)
sf.write(f'{out_dir}/stem_sfx.wav', sfx_bus.astype(np.float32), SR)
sf.write(f'{out_dir}/stem_music.wav', music.astype(np.float32), SR)
pk = np.max(np.abs(mixed)); mixed = mixed / max(1.0, pk / 0.98)
sf.write(f'{out_dir}/mix_premaster.wav', mixed.astype(np.float32), SR, subtype='FLOAT')
print('premaster peak', pk)
