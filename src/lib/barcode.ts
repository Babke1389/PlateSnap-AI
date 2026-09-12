import { MealAnalysis } from './types-ai';

export class ProductNotFoundError extends Error {
  constructor(barcode: string) {
    super(`No product found for barcode ${barcode}`);
    this.name = 'ProductNotFoundError';
  }
}

/**
 * Looks up a barcode against Open Food Facts (openfoodfacts.org) — a free,
 * community-run product database. No API key needed.
 *
 * Prefers per-serving nutrition values when the product defines a serving
 * size; falls back to per-100g values (and labels the item accordingly) when
 * it doesn't.
 */
export async function lookupBarcode(barcode: string): Promise<MealAnalysis> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode
  )}.json?fields=product_name,brands,nutriments,serving_size`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err: any) {
    throw new Error(`Could not reach the product database: ${err?.message ?? err}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Product lookup failed (${response.status})`);
  }

  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    throw new ProductNotFoundError(barcode);
  }

  const p = data.product;
  const n = p.nutriments ?? {};
  const name: string = p.product_name || p.brands || 'Scanned product';

  const hasServing =
    n['energy-kcal_serving'] != null ||
    n['proteins_serving'] != null ||
    n['carbohydrates_serving'] != null ||
    n['fat_serving'] != null;

  const calories = hasServing ? n['energy-kcal_serving'] : n['energy-kcal_100g'];
  const proteinG = hasServing ? n['proteins_serving'] : n['proteins_100g'];
  const carbsG = hasServing ? n['carbohydrates_serving'] : n['carbohydrates_100g'];
  const fatG = hasServing ? n['fat_serving'] : n['fat_100g'];

  if (calories == null) {
    throw new Error(`"${name}" doesn't have calorie data in the product database.`);
  }

  const label = hasServing ? name : `${name} (per 100g)`;

  return {
    calories: Math.round(Number(calories) || 0),
    proteinG: Math.round(Number(proteinG) || 0),
    carbsG: Math.round(Number(carbsG) || 0),
    fatG: Math.round(Number(fatG) || 0),
    items: [label],
    confidence: 'barcode',
  };
}
