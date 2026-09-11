import { FoodNutrition } from './food-db';

/**
 * Looks up packaged food nutrition by barcode using the free, keyless
 * Open Food Facts API. Values are per 100g/100ml as reported by the
 * product's label — add-meal.tsx scales them by the grams the user enters.
 */

const OFF_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const REQUEST_TIMEOUT_MS = 15000;

export interface BarcodeProduct {
  code: string;
  name: string;
  brand?: string;
  per100g: FoodNutrition;
}

export class ProductNotFoundError extends Error {
  constructor() {
    super('No product found for this barcode');
    this.name = 'ProductNotFoundError';
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export async function lookupBarcode(code: string): Promise<BarcodeProduct> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(
      `${OFF_ENDPOINT}/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments`,
      { signal: controller.signal }
    );
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Barcode lookup timed out. Check your connection and try again.');
    }
    throw new Error(`Could not reach the product database: ${err?.message ?? err}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Product database error ${response.status}`);
  }

  const data = await response.json();
  if (data?.status !== 1 || !data?.product) {
    throw new ProductNotFoundError();
  }

  const product = data.product;
  const nutriments = product.nutriments ?? {};
  const calories =
    nutriments['energy-kcal_100g'] ??
    (nutriments['energy_100g'] != null ? nutriments['energy_100g'] / 4.184 : undefined);

  if (calories == null) {
    throw new Error("This product doesn't have nutrition facts listed.");
  }

  return {
    code,
    name: product.product_name?.trim() || 'Unknown product',
    brand: product.brands?.split(',')[0]?.trim() || undefined,
    per100g: {
      calories: Math.round(calories),
      proteinG: round1(nutriments['proteins_100g'] ?? 0),
      carbsG: round1(nutriments['carbohydrates_100g'] ?? 0),
      fatG: round1(nutriments['fat_100g'] ?? 0),
    },
  };
}
