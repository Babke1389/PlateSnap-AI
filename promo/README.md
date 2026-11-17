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

## Third video: "Biceps tier list" (`BicepsTierList`)

A 21 s slideshow in the gym tier-list format: seven illustrated slides (masked lifter, veiny
arm close-ups, dark gym and hallway backgrounds) with TikTok-style captions, a slow Ken Burns push,
film grain and vignette, hard cuts every 4 beats, and a "Pro tip" slide showing PlateSnap.
Music: `MOOD=dark python scripts/music.py public/audio/tier-music.wav 22.5 80 1.5 33`.

```bash
npx remotion render BicepsTierList out/platesnap-biceps-tier-list.mp4
```

Code: `src/tier/TierSlideshow.tsx` (slides and captions) and `src/tier/art.tsx` (illustrations).

## Fourth video: triceps exercise explainer (`TricepsGuide`)

A 27 s 3D-anatomy-style explainer for the kneeling overhead cable triceps extension: glossy
mannequin built from capsules (`src/triceps/Mannequin.tsx`), red muscle highlight, green/blue
range-of-motion arcs, a pushdown comparison, and a mid-video PlateSnap AI "cutting or bulking?"
insert. Music: `python scripts/music.py public/audio/triceps-music.wav 28 96 0 44`.
Narration: male voice (Kokoro `am_michael`) via `python scripts/narration.py am_michael public/audio triceps`;
line timings are in `NARRATION` in `src/triceps/TricepsGuide.tsx`.

```bash
npx remotion render TricepsGuide out/platesnap-triceps-guide.mp4
```

## Fifth video: storytime, "it was the guessing" (`GuessingStory`)

A 31 s first-person story (fast cuts, punch-in on every scene, word-by-word captions) that doesn't play like an ad: three weeks of "eating clean", the scale
goes up, a friend says "just snap it", the salad turns out to be 740 kcal (dressing 280), eight
weeks of logging, and a quiet end card. The brand only appears in the last seconds.
Male narration (Kokoro `am_michael`, 1.12x speed, silence-trimmed with ffmpeg `silenceremove`) via `python scripts/narration.py am_michael public/audio story`;
music via `python scripts/music.py public/audio/story-music.wav 32 88 3.6 55`.

```bash
npx remotion render GuessingStory out/platesnap-story-guessing.mp4
```

## Sixth video: storytime, "I was a hard guesser" (`HardgainerStory`)

The bulking counterpart (33 s): six months of "eating a lot", still 65 kg, a gym partner says
"snap every meal", the biggest day is only 1,890 kcal and breakfast 340, then +5 kg in ten weeks.
Narration: `python scripts/narration.py am_michael public/audio bulk` (then the same loudnorm +
silenceremove as the first story); music: `python scripts/music.py public/audio/bulk-music.wav 34 90 4.2 77`.

Both stories are configs in `src/story/stories.tsx` on top of the shared `src/story/StoryKit.tsx`
(notes, scale, chat, scan, progress, end card, captions). A new story is a new `StoryConfig`.

```bash
npx remotion render HardgainerStory out/platesnap-story-hardgainer.mp4
```
