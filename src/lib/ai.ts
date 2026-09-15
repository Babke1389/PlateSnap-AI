/**
 * Meal analysis.
 *
 * Text descriptions (EXPO_PUBLIC_GROQ_API_KEY set, see groq.ts) go to Groq
 * for a real language-model estimate. Photos (EXPO_PUBLIC_GEMINI_API_KEY
 * set, see gemini.ts) go to Google Gemini instead — Groq's current model
 * lineup has no vision-capable model, so it can't be used for photos.
 *
 * Without the relevant key configured, this falls back to local-only
 * heuristics: `analyzeMealText` matches words against a small hand-written
 * food lookup table (see food-db.ts) for a plausible ballpark;
 * `analyzeMealPhoto` can't see the image at all and returns a generic
 * placeholder guess. See add-meal.tsx for how the UI distinguishes these
 * cases (isTextAiConfigured() / isPhotoAiConfigured()).
 */

import { analyzeTextWithGroq, isAiConfigured as isTextAiConfigured, NoFoodDetectedError } from './groq';
import { analyzePhotoWithGemini, isGeminiConfigured as isPhotoAiConfigured } from './gemini';
import { matchFoods } from './food-db';
import { MealAnalysis } from './types-ai';

export { isTextAiConfigured, isPhotoAiConfigured, NoFoodDetectedError };

const STUB_DELAY_MS = 900;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function guessedFallback(seed: string, label: string): MealAnalysis {
  const h = hashString(seed);
  const calories = 250 + (h % 300); // 250-550 kcal, a saner default range
  const proteinG = Math.round((calories * 0.2) / 4);
  const fatG = Math.round((calories * 0.3) / 9);
  const carbsG = Math.max(
    Math.round((calories - proteinG * 4 - fatG * 9) / 4),
    0
  );
  return { calories, proteinG, carbsG, fatG, items: [label], confidence: 'guessed' };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function localTextEstimate(description: string): MealAnalysis {
  const matches = matchFoods(description);

  if (matches.length === 0) {
    return guessedFallback(description.toLowerCase(), description);
  }

  const totals = matches.reduce(
    (acc, m) => ({
      calories: acc.calories + m.nutrition.calories,
      proteinG: acc.proteinG + m.nutrition.proteinG,
      carbsG: acc.carbsG + m.nutrition.carbsG,
      fatG: acc.fatG + m.nutrition.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return {
    calories: Math.round(totals.calories),
    proteinG: Math.round(totals.proteinG),
    carbsG: Math.round(totals.carbsG),
    fatG: Math.round(totals.fatG),
    items: matches.map((m) => titleCase(m.key)),
    confidence: 'matched',
  };
}

export async function analyzeMealText(description: string): Promise<MealAnalysis> {
  const trimmed = description.trim();

  if (isTextAiConfigured()) {
    return analyzeTextWithGroq(trimmed);
  }

  await new Promise((r) => setTimeout(r, STUB_DELAY_MS));
  return localTextEstimate(trimmed);
}

export async function analyzeMealPhoto(photo: { uri: string; base64?: string; mimeType?: string }): Promise<MealAnalysis> {
  if (isPhotoAiConfigured()) {
    if (!photo.base64) {
      throw new Error('No image data captured for this photo — try picking it again.');
    }
    return analyzePhotoWithGemini(photo.base64, photo.mimeType ?? 'image/jpeg');
  }

  await new Promise((r) => setTimeout(r, STUB_DELAY_MS + 500));
  // No real vision model is configured — this cannot see the photo's contents.
  return guessedFallback(photo.uri, 'Meal from photo');
}
