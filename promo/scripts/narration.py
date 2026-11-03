"""English narration for the promo, via Kokoro TTS (Apache-2.0, runs locally).

Setup:  pip install kokoro-onnx soundfile
        download kokoro-v1.0.onnx and voices-v1.0.bin from
        https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Usage:  python scripts/narration.py [voice] [out_dir]     (default: af_heart public/audio)
If line lengths change, update `dur` in src/Soundtrack.tsx (printed below).
"""
import os
MODEL = os.environ.get("KOKORO_MODEL", "kokoro-v1.0.onnx")
VOICES = os.environ.get("KOKORO_VOICES", "voices-v1.0.bin")
import sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro(MODEL, VOICES)
voice = sys.argv[1] if len(sys.argv) > 1 else "af_heart"
out = sys.argv[2] if len(sys.argv) > 2 else "public/audio"
lines = [
 "Snap your plate. Know your calories.",
 "PlateSnap AI scans your meal, and estimates calories and macros in seconds.",
 "Track every macro, every day, and watch your progress add up.",
 "Log by photo or text, follow your trends, and see how far you've come.",
 "PlateSnap AI. Download free today.",
]
for i, t in enumerate(lines):
    a, sr = k.create(t, voice=voice, speed=1.0, lang="en-us")
    sf.write(f"{out}/vo{i+1}.wav", a, sr)
    print(i+1, round(len(a)/sr, 2))
