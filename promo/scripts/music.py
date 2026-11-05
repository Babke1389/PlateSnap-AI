"""Procedurally generated chill lo-fi bed for the promo (no samples, no licensing).

Usage: python scripts/music.py public/audio/music.wav [length_s] [bpm] [drums_in_s] [seed]
Needs numpy, scipy, soundfile.
"""
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 80
BEAT = 60 / BPM
LENGTH = float(sys.argv[2]) if len(sys.argv) > 2 else 24.0  # a little longer than the 22.7 s video; it is faded out in Remotion
rng = np.random.default_rng(int(sys.argv[5]) if len(sys.argv) > 5 else 7)
N = int(LENGTH * SR)
mix_keys = np.zeros(N)
mix_bass = np.zeros(N)
mix_drums = np.zeros(N)


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def place(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf):
        return
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i]


def epiano(freq, dur, vel=1.0):
    t = np.arange(int((dur + 1.5) * SR)) / SR
    env = np.exp(-t * 1.6) * np.minimum(1, t / 0.006)
    release = np.clip(1 - (t - dur) / 1.2, 0, 1)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.2 * t)
    tone = (
        np.sin(2 * np.pi * freq * t)
        + 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3)
        + 0.12 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 6)
        + 0.05 * np.sin(2 * np.pi * 7 * freq * t) * np.exp(-t * 20)  # tine
    )
    return vel * tone * env * release * trem


def bass(freq, dur):
    t = np.arange(int((dur + 0.3) * SR)) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t * 0.9) * np.clip(1 - (t - dur) / 0.25, 0, 1)
    return (np.sin(2 * np.pi * freq * t) + 0.2 * np.sin(2 * np.pi * 2 * freq * t)) * env


def kick():
    t = np.arange(int(0.45 * SR)) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare():
    t = np.arange(int(0.3 * SR)) / SR
    n = hp(lp(rng.standard_normal(len(t)), 5000), 900) * np.exp(-t * 18)
    body = 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return 0.5 * n + body


def hat():
    t = np.arange(int(0.06 * SR)) / SR
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 70)


# Fmaj9 - Em7 - Dm9 - Cmaj7, one chord per bar (4 beats = 3 s)
CHORDS = [
    (41, [57, 60, 64, 67]),  # F  : A C E G
    (40, [55, 59, 62, 64]),  # Em : G B D E
    (38, [57, 60, 64, 65]),  # Dm : A C E F
    (36, [55, 59, 62, 64]),  # C  : G B D E
]
BAR = 4 * BEAT
bars = int(np.ceil(LENGTH / BAR))
DRUMS_IN = float(sys.argv[4]) if len(sys.argv) > 4 else 2.7  # drums enter with the scan scene

for b in range(bars):
    root, notes = CHORDS[b % 4]
    t0 = b * BAR
    # chord stabs: beat 1 and the "and" of 2, with a slight strum
    for hit, dur, vel in [(0, 1.3, 1.0), (1.5 * BEAT, 1.6, 0.7)]:
        for j, n in enumerate(notes):
            place(mix_keys, epiano(midi(n), dur, vel), t0 + hit + j * 0.012 + rng.uniform(0, 0.006))
    place(mix_bass, bass(midi(root), 2.2 * BEAT), t0)
    place(mix_bass, 0.7 * bass(midi(root + 7), 1.2 * BEAT), t0 + 2.5 * BEAT)

    for beat in range(4):
        tb = t0 + beat * BEAT
        if tb < DRUMS_IN:
            continue
        if beat in (0, 2):
            place(mix_drums, kick(), tb)
        if beat == 2 and b % 2 == 1:
            place(mix_drums, 0.6 * kick(), tb + 0.5 * BEAT * 1.16)
        if beat in (1, 3):
            place(mix_drums, 0.45 * snare(), tb + 0.01)
        # swung 8th-note hats
        place(mix_drums, 0.12 * hat(), tb)
        place(mix_drums, 0.08 * hat(), tb + BEAT * 0.58)

# lo-fi treatment: dull the keys, add vinyl noise + crackle
keys = lp(mix_keys, 3200) * 0.18
music = keys + lp(mix_bass, 400) * 0.32 + lp(mix_drums, 6000) * 0.55
vinyl = lp(rng.standard_normal(N), 2500) * 0.004
crackle = np.zeros(N)
idx = rng.choice(N, size=int(LENGTH * 6), replace=False)
crackle[idx] = rng.uniform(-0.08, 0.08, len(idx))
music += vinyl + lp(crackle, 4000)

# slow wobble (tape flutter) on volume, then fades
t = np.arange(N) / SR
music *= 1 + 0.02 * np.sin(2 * np.pi * 0.5 * t)
music *= np.minimum(1, t / 0.8)

stereo = np.stack([music, np.roll(music, int(0.008 * SR))], axis=1)
stereo /= np.max(np.abs(stereo)) / 0.8
sf.write(sys.argv[1] if len(sys.argv) > 1 else "music.wav", stereo, SR)
print("wrote", LENGTH, "s")
