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
The video has no audio track; add music with Remotion's `<Audio>` component if you have a licensed track.
