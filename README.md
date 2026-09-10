# Platesnap AI

A calorie & macro tracking app built with Expo (React Native).

## Running it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, `w` for web, or scan the QR code with the Expo Go app on your phone.

## What's here

- **Onboarding** (`app/onboarding/`) — collects age, sex, height, weight, goal weight, and activity level, then computes a daily calorie target (Mifflin-St Jeor + activity multiplier) and macro split (`src/lib/calories.ts`).
- **Today tab** (`app/(tabs)/index.tsx`) — calorie ring, macro bars, water tracker, streak, today's meals.
- **Diary tab** — meal history by day, with delete.
- **Progress tab** — weight trend chart, log-weight modal.
- **Settings tab** — edit goal/activity, upgrade to Pro, reset data.
- **Add meal** (`app/add-meal.tsx`) — describe a meal in text, or (Pro) snap/upload a photo, and get an AI calorie/macro estimate.
- **Paywall** (`app/paywall.tsx`) — gates photo scanning behind "Pro".

All data is stored locally on-device via `AsyncStorage` (`src/lib/storage.ts`) — there's no backend yet.

## Wiring up a real AI provider

`src/lib/ai.ts` currently returns a fake but plausible estimate (with a short delay) instead of calling a real model — see the comment at the top of that file. To go live:

1. Get an API key from Anthropic or OpenAI.
2. For a real app, proxy the request through your own backend rather than calling the provider directly from the phone — an `EXPO_PUBLIC_*` env var is bundled into the client and would expose your key to anyone who inspects the app.
3. Replace the body of `analyzeMealText` / `analyzeMealPhoto` with a real fetch call, keeping the same return shape (`MealAnalysis` in `src/lib/types-ai.ts`).

## Wiring up real payments

The paywall (`app/paywall.tsx`) is UI-only right now: tapping "Continue" just flips a local `isPro` flag so you can test the locked/unlocked states. Before shipping, connect a real processor:

- **iOS/Android app stores**: subscriptions for digital content generally must go through Apple's/Google's in-app purchase systems (e.g. via `react-native-purchases` / RevenueCat), not PayPal or Stripe directly, per store policy.
- **Web**: Stripe Checkout/Billing is the more common fit than PayPal for recurring subscriptions.

Whichever you pick, you'll create the account and get the API keys yourself — plug them in as environment variables, never commit them.
