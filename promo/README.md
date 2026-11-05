# Platesnap AI — promo video (Remotion)

A 22-second vertical (1080×1920, 30 fps) promo for Platesnap AI, built with [Remotion](https://www.remotion.dev).
It lives in its own folder with its own `package.json` so it doesn't touch the Expo app.

Scenes: hook → AI photo scan → Today dashboard → features → call to action.
Colours come from the app's theme (`src/theme.ts` mirrors `../src/theme/index.ts`).

```bash
cd promo
npm install
npm run studio   # live preview / editing in the browser
npm run render   # writes out/platesnap-promo.mp4
npm run still    # writes out/poster.png
```

Edit scene lengths in `SCENES` at the top of `src/PlatesnapPromo.tsx`; copy and numbers are inline in each scene.
## Audio

- **Music** (`public/audio/music.wav`): a chill lo-fi bed generated in code by `scripts/music.py`
  (synthesised electric piano, bass and drums, no samples), so there is nothing to license.
- **Narration** (`public/audio/vo1-5.wav`): English voice-over made with the open-source
  [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) TTS model (voice `af_heart`) by `scripts/narration.py`,
  then loudness-normalised to -15 LUFS with ffmpeg `loudnorm`.
- `src/Soundtrack.tsx` places each line and ducks the music under the voice. If you re-record lines,
  update their `at`/`dur` there.

Script:
1. "Snap your plate. Know your calories."
2. "PlateSnap AI scans your meal, and estimates calories and macros in seconds."
3. "Track every macro, every day, and watch your progress add up."
4. "Log by photo or text, follow your trends, and see how far you've come."
5. "PlateSnap AI. Download free today."

## Second video: "Full day of eating" (`FullDayOfEating`)

A ~37 s UGC-style ad in the "full day of eating" format, fully animated: intro with the daily
target, six illustrated meals with TikTok-style captions and hand-held camera drift, a PlateSnap
photo-scan and Today screen, and a day-total end card. Hard cuts land on the beat of a 90 BPM
track (`public/audio/fdoe-music.wav`, from `python scripts/music.py public/audio/fdoe-music.wav 38 90 0 21`).

```bash
npx remotion render FullDayOfEating out/platesnap-full-day-of-eating.mp4
```

Narration: female voice (Kokoro `af_heart`), made with
`python scripts/narration.py af_heart public/audio fdoe` and loudness-normalised like the first video;
line timings are in `NARRATION` in `src/fdoe/FullDayOfEating.tsx`, and the music ducks under each line.

Code: `src/fdoe/FullDayOfEating.tsx` (scenes, calorie numbers) and `src/fdoe/foods.tsx` (food illustrations).
