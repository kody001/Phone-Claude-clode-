"""Small DSP toolkit for procedural sound design (48 kHz, float32, stereo = (n, 2))."""
import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur, color='white', rng=RNG):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    if color == 'white':
        return w
    if color == 'pink':
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        p = signal.lfilter(b, a, w)
        return p / (np.std(p) + 1e-9)
    if color == 'brown':
        b = np.cumsum(w)
        b = signal.lfilter([1, -1], [1, -0.995], b)
        return b / (np.std(b) + 1e-9)
    raise ValueError(color)


def sos(kind, f, order=4):
    if kind in ('bandpass', 'bandstop'):
        return signal.butter(order, [max(10, f[0]), min(SR / 2 - 100, f[1])], btype=kind, fs=SR, output='sos')
    return signal.butter(order, min(max(10, f), SR / 2 - 100), btype=kind, fs=SR, output='sos')


def lp(x, f, order=4): return signal.sosfilt(sos('lowpass', f, order), x, axis=0)
def hp(x, f, order=4): return signal.sosfilt(sos('highpass', f, order), x, axis=0)
def bp(x, lo, hi, order=4): return signal.sosfilt(sos('bandpass', (lo, hi), order), x, axis=0)


def sweep_bp(x, f0, f1, q=2.0, steps=64):
    """Band-pass with a moving centre frequency (piecewise, overlap-added)."""
    n = len(x); out = np.zeros(n); hop = max(1, n // steps); win = np.hanning(hop * 2)
    for k in range(0, n, hop):
        seg = x[max(0, k - hop):k + hop]
        if len(seg) < 16:
            continue
        fc = f0 * (f1 / f0) ** (k / max(1, n))
        lo, hi = fc / (1 + 1 / q), fc * (1 + 1 / q)
        y = bp(seg, lo, hi, 2)
        w = np.hanning(len(y))
        out[max(0, k - hop):max(0, k - hop) + len(y)] += y * w
    return out


def env_exp(dur, decay, attack=0.002):
    t = t_axis(dur)
    e = np.exp(-t / max(1e-4, decay))
    if attack > 0:
        e *= np.clip(t / attack, 0, 1)
    return e


def env_adsr(dur, a=0.01, d=0.1, s=0.7, r=0.2):
    n = int(dur * SR); e = np.zeros(n); t = np.arange(n) / SR
    rs = dur - r
    e = np.where(t < a, t / max(a, 1e-6), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-6), s))
    e = np.where(t > rs, e * np.clip((dur - t) / max(r, 1e-6), 0, 1), e)
    return e


def osc(freq, dur, kind='sine', phase=0.0):
    """freq may be scalar or array (per-sample)."""
    n = int(dur * SR)
    if np.isscalar(freq):
        f = np.full(n, freq, dtype=float)
    else:
        f = np.asarray(freq, dtype=float)[:n]
        if len(f) < n:
            f = np.concatenate([f, np.full(n - len(f), f[-1] if len(f) else 0.0)])
    ph = 2 * np.pi * np.cumsum(f) / SR + phase
    if kind == 'sine':
        return np.sin(ph)
    if kind == 'saw':
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == 'square':
        return np.sign(np.sin(ph))
    if kind == 'tri':
        return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    raise ValueError(kind)


def glide(f0, f1, dur, curve='exp'):
    t = np.linspace(0, 1, int(dur * SR))
    return f0 * (f1 / f0) ** t if curve == 'exp' else f0 + (f1 - f0) * t


def modal(freqs, decays, amps, dur, rng=RNG, detune=0.0):
    t = t_axis(dur); y = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        f2 = f * (1 + detune * rng.uniform(-1, 1))
        y += a * np.sin(2 * np.pi * f2 * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    return y


def ks(freq, dur, damp=0.996, bright=0.5, rng=RNG):
    """Karplus-Strong plucked string."""
    n = int(dur * SR); p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    buf = lp(buf, 2000 + 8000 * bright, 2) if p > 30 else buf
    out = np.zeros(n); idx = 0
    b = buf.copy()
    for i in range(n):
        out[i] = b[idx]
        nxt = (idx + 1) % p
        b[idx] = damp * 0.5 * (b[idx] + b[nxt])
        idx = nxt
    return out


def ks_fast(freq, dur, damp=0.996, bright=0.5, rng=RNG):
    """Vectorised-ish Karplus-Strong (block processing by period)."""
    n = int(dur * SR); p = max(2, int(round(SR / freq)))
    b = rng.uniform(-1, 1, p)
    if p > 30:
        b = lp(b, 1500 + 9000 * bright, 2)
    reps = n // p + 2
    out = np.empty(reps * p)
    for r in range(reps):
        out[r * p:(r + 1) * p] = b
        b = damp * 0.5 * (b + np.roll(b, -1))
    return out[:n]


def fm(fc, ratio, index, dur, idx_decay=0.5, amp_decay=1.0):
    t = t_axis(dur)
    mod = index * np.exp(-t / idx_decay) * np.sin(2 * np.pi * fc * ratio * t)
    return np.sin(2 * np.pi * fc * t + mod) * np.exp(-t / amp_decay)


def sat(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


def fade(x, fi=0.005, fo=0.02):
    n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    y = x.copy()
    if a > 0:
        y[:a] *= np.linspace(0, 1, a)[:, None] if y.ndim == 2 else np.linspace(0, 1, a)
    if b > 0:
        y[-b:] *= np.linspace(1, 0, b)[:, None] if y.ndim == 2 else np.linspace(1, 0, b)
    return y


def stereo(x, pan=0.0, width=0.0, rng=RNG):
    """mono -> stereo with constant-power pan (-1..1) and optional decorrelated width."""
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    if width > 0:
        d = int(0.0004 * SR + rng.integers(0, int(0.0006 * SR) + 1))
        xr = np.concatenate([np.zeros(d), x[:-d]]) if d < len(x) else x
        return np.stack([x * l * 1.41, (x * (1 - width) + xr * width) * r * 1.41], 1) * 0.707
    return np.stack([x * l, x * r], 1) * 1.414 * 0.707


def pan_sweep(x, p0, p1):
    p = np.linspace(p0, p1, len(x))
    l = np.cos((p + 1) * np.pi / 4); r = np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1)


def ir(dur=1.2, decay=0.4, bright=6000, metallic=False, rng=RNG, predelay=0.008):
    n = int(dur * SR); t = np.arange(n) / SR
    chans = []
    for c in range(2):
        e = rng.standard_normal(n) * np.exp(-t / decay)
        e = lp(e, bright, 2)
        if metallic:
            e += 0.4 * modal([523, 811, 1187, 1730, 2410], [decay * 0.6] * 5, [0.3, 0.25, 0.2, 0.15, 0.1], dur, rng) * rng.standard_normal(n) * 0.3
        pd = int(predelay * SR)
        e = np.concatenate([np.zeros(pd), e])[:n]
        chans.append(e / np.sqrt(np.sum(e ** 2) + 1e-9))
    return np.stack(chans, 1)


def reverb(x, wet=0.25, dur=1.2, decay=0.4, bright=6000, metallic=False):
    if x.ndim == 1:
        x = stereo(x)
    h = ir(dur, decay, bright, metallic)
    y = np.stack([signal.fftconvolve(x[:, c], h[:, c])[:len(x) + len(h) - 1] for c in range(2)], 1)
    dry = np.vstack([x, np.zeros((len(h) - 1, 2))])
    return dry * (1 - wet) + y * wet * 0.9


def pad_to(x, n):
    if len(x) >= n:
        return x[:n]
    z = np.zeros((n - len(x),) + x.shape[1:])
    return np.concatenate([x, z])


def place(buf, x, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if i < 0:
        x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


def db(x): return 10 ** (x / 20)


def note(n):
    """MIDI note number -> Hz"""
    return 440.0 * 2 ** ((n - 69) / 12)


def mix(*xs):
    """Sum arrays of different lengths (zero-padded)."""
    n = max(len(x) for x in xs); shp = (n,) + xs[0].shape[1:]
    out = np.zeros(shp)
    for x in xs:
        out[:len(x)] += x
    return out
