import { NoFoodDetectedError } from './groq';
import { MealAnalysis } from './types-ai';

/**
 * Photo analysis via Google Gemini. Groq's current model lineup on this
 * account has no vision-capable model, so meal photos go to Gemini instead
 * while text descriptions keep using Groq (see groq.ts / ai.ts).
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 45000;

export function isGeminiConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

const SYSTEM_PROMPT = `You are a nutrition estimation assistant inside a calorie tracking app.
You will be given a photo of food (or possibly not food at all).

Respond with ONLY a single JSON object, no markdown fences, no extra commentary, matching exactly this shape:
{"foodDetected": boolean, "items": string[], "calories": number, "proteinG": number, "carbsG": number, "fatG": number}

Rules:
- If the photo does NOT show any food or drink (e.g. it's a person, an object, a landscape, blank, unclear, etc.), set "foodDetected" to false and set all numbers to 0 and "items" to [].
- If food is present, set "foodDetected" to true, list the distinct food items you can identify in "items" (short names), and give your best-effort estimate of total calories and macros (in grams) for the whole portion shown.
- Base portion size estimates on what's visually plausible in the photo (e.g. plate size, typical serving).
- Numbers must be plain numbers (no units, no ranges, no text).
- Always return valid JSON and nothing else.`;

export async function analyzePhotoWithGemini(base64: string, mimeType: string): Promise<MealAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nHere is the photo.` },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Gemini request timed out. Check your connection and try again.');
    }
    throw new Error(`Could not reach Gemini: ${err?.message ?? err}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${bodyText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini returned an unparseable response');
    parsed = JSON.parse(match[0]);
  }

  if (parsed.foodDetected === false) {
    throw new NoFoodDetectedError();
  }

  return {
    calories: Math.max(Math.round(Number(parsed.calories) || 0), 0),
    proteinG: Math.max(Math.round(Number(parsed.proteinG) || 0), 0),
    carbsG: Math.max(Math.round(Number(parsed.carbsG) || 0), 0),
    fatG: Math.max(Math.round(Number(parsed.fatG) || 0), 0),
    items: Array.isArray(parsed.items) && parsed.items.length ? parsed.items : ['Meal'],
    confidence: 'ai',
  };
}
