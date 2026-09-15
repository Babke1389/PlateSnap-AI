import { MealAnalysis } from './types-ai';

const GROQ_MODEL = 'qwen/qwen3.8-27b';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 45000;

export function isAiConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_GROQ_API_KEY;
}

export class NoFoodDetectedError extends Error {
  constructor() {
    super("No food detected in this photo");
    this.name = 'NoFoodDetectedError';
  }
}

const SYSTEM_PROMPT = `You are a nutrition estimation assistant inside a calorie tracking app.
You will be given either a text description of a meal, or a photo of food (or possibly not food at all).

Respond with ONLY a single JSON object, no markdown fences, no extra commentary, matching exactly this shape:
{"foodDetected": boolean, "items": string[], "calories": number, "proteinG": number, "carbsG": number, "fatG": number}

Rules:
- If given a photo and it does NOT show any food or drink (e.g. it's a person, an object, a landscape, blank, unclear, etc.), set "foodDetected" to false and set all numbers to 0 and "items" to [].
- If food is present, set "foodDetected" to true, list the distinct food items you can identify in "items" (short names), and give your best-effort estimate of total calories and macros (in grams) for the whole portion shown or described.
- Base portion size estimates on what's visually plausible in the photo (e.g. plate size, typical serving), or on what's stated in the text.
- Numbers must be plain numbers (no units, no ranges, no text).
- Always return valid JSON and nothing else.`;

interface GroqContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

async function callGroq(userContent: GroqContentPart[]): Promise<MealAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('No Groq API key configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Groq request timed out. Check your connection and try again.');
    }
    throw new Error(`Could not reach Groq: ${err?.message ?? err}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`Groq API error ${response.status}: ${bodyText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Groq returned an unparseable response');
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

export async function analyzeTextWithGroq(description: string): Promise<MealAnalysis> {
  return callGroq([{ type: 'text', text: `Meal description: "${description}"` }]);
}
