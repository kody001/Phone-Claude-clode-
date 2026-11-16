"""Small DSP toolkit used by the SFX library, music and mixer (48 kHz float32)."""
import numpy as np
from scipy import signal

SR = 48000


def N(d):
    return max(1, int(round(d * SR)))


def tt(d):
    return np.arange(N(d)) / SR


def noise(d, rng):
    return rng.standard_normal(N(d))


def pink(d, rng):
    n = N(d)
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    X /= np.sqrt(f)
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def _sos(kind, f, order=2):
    if kind == 'band':
        lo, hi = f
        lo = max(10, lo)
        hi = min(SR / 2 - 100, hi)
        return signal.butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return signal.butter(order, min(f, SR / 2 - 100), kind, fs=SR, output='sos')


def lp(x, f, order=2):
    return signal.sosfilt(_sos('low', f, order), x, axis=0)


def hp(x, f, order=2):
    return signal.sosfilt(_sos('high', f, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(_sos('band', (lo, hi), order), x, axis=0)


def peak(x, f, q=4, gain_db=6):
    b, a = signal.iirpeak(f, q, fs=SR)
    y = signal.lfilter(b, a, x, axis=0)
    g = 10 ** (gain_db / 20) - 1
    return x + g * y


def env_exp(d, tau, attack=0.002):
    t = tt(d)
    e = np.exp(-t / tau)
    a = N(attack)
    if a > 1:
        e[:a] *= np.linspace(0, 1, a)
    return e


def adsr(d, a=0.01, dc=0.1, s=0.7, r=0.2):
    n = N(d)
    e = np.ones(n) * s
    na, nd, nr = N(a), N(dc), N(r)
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na)
    if na + nd < n:
        e[na:na + nd] = np.linspace(1, s, nd)
    nr = min(nr, n)
    e[n - nr:] *= np.linspace(1, 0, nr)
    return e


def bell_curve(d, center=0.5, width=0.25):
    t = np.linspace(0, 1, N(d))
    return np.exp(-((t - center) / width) ** 2)


def fade(x, fi=0.005, fo=0.01):
    x = x.copy()
    a, b = min(N(fi), len(x)), min(N(fo), len(x))
    if a > 1:
        x[:a] = (x[:a].T * np.linspace(0, 1, a)).T
    if b > 1:
        x[-b:] = (x[-b:].T * np.linspace(1, 0, b)).T
    return x


def phase_from_freq(freq):
    return 2 * np.pi * np.cumsum(freq) / SR


def sine(f, d, ph=0):
    if np.isscalar(f):
        return np.sin(2 * np.pi * f * tt(d) + ph)
    return np.sin(phase_from_freq(f) + ph)


def saw(f, d):
    ph = (np.cumsum(np.broadcast_to(f, (N(d),))) / SR) % 1.0
    return 2 * ph - 1


def square(f, d, duty=0.5):
    ph = (np.cumsum(np.broadcast_to(f, (N(d),))) / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0)


def tri(f, d):
    ph = (np.cumsum(np.broadcast_to(f, (N(d),))) / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def glide(f0, f1, d, curve='exp'):
    t = np.linspace(0, 1, N(d))
    if curve == 'exp':
        return f0 * (f1 / f0) ** t
    return f0 + (f1 - f0) * t


def norm(x, pk=0.9):
    m = np.abs(x).max()
    return x * (pk / m) if m > 0 else x


def mono(x):
    return x.mean(axis=1) if x.ndim == 2 else x


def st(x, pan=0.0, width=0.0, rng=None):
    """mono -> stereo with constant-power pan (-1..1) and optional decorrelated width"""
    if x.ndim == 2:
        return x
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    y = np.stack([x * l, x * r], axis=1) * np.sqrt(2) * 0.7071
    if width > 0:
        d = N(0.011)
        sh = np.concatenate([np.zeros(d), x[:-d]]) if len(x) > d else x
        y[:, 1] = (1 - width) * y[:, 1] + width * sh * r
    return y


def mix_into(dst, src, at):
    """add src (n,2) into dst (m,2) at sample index at"""
    if at >= len(dst) or at + len(src) <= 0:
        return
    s0 = max(0, -at)
    a = max(0, at)
    n = min(len(src) - s0, len(dst) - a)
    if n > 0:
        dst[a:a + n] += src[s0:s0 + n]


_IR = {}


def reverb_ir(t60=1.5, damp=5000, seed=1, pre=0.012):
    key = (round(t60, 2), damp, seed, pre)
    if key in _IR:
        return _IR[key]
    rng = np.random.default_rng(seed)
    n = N(t60 * 1.2)
    t = np.arange(n) / SR
    decay = np.exp(-6.91 * t / t60)
    ir = np.zeros((n, 2))
    for ch in range(2):
        nz = rng.standard_normal(n) * decay
        nz = lp(nz, damp)
        # early reflections
        for k in range(6):
            idx = int((pre + rng.uniform(0.003, 0.04)) * SR)
            if idx < n:
                nz[idx] += rng.uniform(0.3, 0.7) * (1 if rng.random() > 0.5 else -1)
        ir[:, ch] = nz
    pd = N(pre)
    ir = np.concatenate([np.zeros((pd, 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(axis=0)).max() + 1e-9
    _IR[key] = ir
    return ir


def reverb(x, t60=1.5, mix=0.3, damp=5000, seed=1, pre=0.012):
    x = st(x) if x.ndim == 1 else x
    ir = reverb_ir(t60, damp, seed, pre)
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in range(2)], axis=1)
    out = np.zeros_like(wet)
    out[:len(x)] += x * (1 - mix * 0.5)
    out += wet * mix
    return out


def tv_bandpass(x, centers, width_oct=0.6, nfft=1024):
    """time-varying band-pass via STFT. centers: array of center freqs per STFT frame (or callable u->f)."""
    f, t, Z = signal.stft(x, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    nfr = Z.shape[1]
    if callable(centers):
        cs = np.array([centers(i / max(1, nfr - 1)) for i in range(nfr)])
    else:
        cs = np.interp(np.linspace(0, 1, nfr), np.linspace(0, 1, len(centers)), centers)
    cs = np.maximum(cs, 20)
    lf = np.log2(np.maximum(f, 1))[:, None]
    mask = np.exp(-((lf - np.log2(cs)[None, :]) / width_oct) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    return y[:len(x)]


def karplus(f, d, decay=0.996, bright=0.5, rng=None, pluck_pos=0.0):
    """Karplus-Strong plucked string via IIR comb (fast)."""
    rng = rng or np.random.default_rng(0)
    n = N(d)
    L = max(2, int(round(SR / f)))
    exc = rng.uniform(-1, 1, L)
    exc = lp(exc, 500 + bright * 9000)
    x = np.zeros(n)
    x[:L] = exc
    g = decay
    a = np.zeros(L + 2)
    a[0] = 1
    a[L] = -g * 0.5
    a[L + 1] = -g * 0.5
    y = signal.lfilter([1.0], a, x)
    return y


def formant_voice(f0, d, vowel='a', breath=0.15, rng=None, vib=0.0, vibf=5.5):
    """crude formant synthesis of a sung/voiced vowel; f0 can be array."""
    rng = rng or np.random.default_rng(0)
    F = {'a': [(730, 90, 1.0), (1090, 110, 0.5), (2440, 160, 0.25)], 'o': [(570, 80, 1.0), (840, 90, 0.45), (2410, 150, 0.15)],
         'u': [(300, 60, 1.0), (870, 90, 0.25), (2240, 150, 0.1)], 'e': [(530, 80, 1.0), (1840, 120, 0.5), (2480, 160, 0.3)],
         'i': [(270, 60, 1.0), (2290, 130, 0.4), (3010, 180, 0.3)]}[vowel]
    n = N(d)
    f = np.broadcast_to(f0, (n,)).astype(float)
    if vib:
        f = f * (1 + vib * np.sin(2 * np.pi * vibf * tt(d)))
    src = saw(f, d) + breath * rng.standard_normal(n)
    src = lp(src, 5000)
    out = np.zeros(n)
    for fc, bw, g in F:
        out += g * bp(src, fc - bw, fc + bw, 2)
    return out


def padd(a, *bs):
    """add arrays of different lengths, aligned at the start"""
    n = max([len(a)] + [len(b) for b in bs])
    out = np.zeros(n)
    out[:len(a)] += a
    for b in bs:
        out[:len(b)] += b
    return out


def tv_lowpass(x, cut, nfft=1024):
    """time-varying low-pass (cut: array of cutoff Hz over the signal)"""
    f, t, Z = signal.stft(x, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    nfr = Z.shape[1]
    cs = np.interp(np.linspace(0, 1, nfr), np.linspace(0, 1, len(cut)), cut)
    mask = 1 / (1 + (f[:, None] / cs[None, :]) ** 4)
    _, y = signal.istft(Z * mask, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    return y[:len(x)]
