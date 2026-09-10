export interface FoodNutrition {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Rough nutrition values for one typical serving of common foods.
 * This is a hand-written lookup table, not a nutrition database or AI model —
 * it's meant to make text descriptions land in a plausible ballpark, not be
 * gram-accurate. Packaged/branded foods (protein puddings, specific bars,
 * etc.) can vary a lot from these generic values.
 */
export const FOOD_DB: Record<string, FoodNutrition> = {
  'chicken breast': { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  'chicken thigh': { calories: 209, proteinG: 26, carbsG: 0, fatG: 10.9 },
  chicken: { calories: 190, proteinG: 29, carbsG: 0, fatG: 7.4 },
  rice: { calories: 205, proteinG: 4.3, carbsG: 45, fatG: 0.4 },
  broccoli: { calories: 55, proteinG: 3.7, carbsG: 11, fatG: 0.6 },
  egg: { calories: 78, proteinG: 6.3, carbsG: 0.6, fatG: 5.3 },
  eggs: { calories: 78, proteinG: 6.3, carbsG: 0.6, fatG: 5.3 },
  toast: { calories: 75, proteinG: 2.6, carbsG: 14, fatG: 1 },
  bread: { calories: 80, proteinG: 3, carbsG: 14, fatG: 1 },
  avocado: { calories: 120, proteinG: 1.5, carbsG: 6, fatG: 10.5 },
  salmon: { calories: 208, proteinG: 20, carbsG: 0, fatG: 13 },
  'ground beef': { calories: 250, proteinG: 26, carbsG: 0, fatG: 17 },
  beef: { calories: 250, proteinG: 26, carbsG: 0, fatG: 17 },
  pasta: { calories: 220, proteinG: 8, carbsG: 43, fatG: 1.3 },
  'sweet potato': { calories: 112, proteinG: 2, carbsG: 26, fatG: 0.1 },
  potato: { calories: 160, proteinG: 4, carbsG: 37, fatG: 0.2 },
  oatmeal: { calories: 150, proteinG: 5, carbsG: 27, fatG: 2.5 },
  banana: { calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4 },
  apple: { calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3 },
  yogurt: { calories: 150, proteinG: 8, carbsG: 17, fatG: 4 },
  milk: { calories: 122, proteinG: 8, carbsG: 12, fatG: 5 },
  cheese: { calories: 110, proteinG: 7, carbsG: 1, fatG: 9 },
  salad: { calories: 40, proteinG: 2, carbsG: 7, fatG: 0.5 },
  vegetables: { calories: 50, proteinG: 2, carbsG: 10, fatG: 0.3 },
  pizza: { calories: 285, proteinG: 12, carbsG: 36, fatG: 10 },
  burger: { calories: 350, proteinG: 17, carbsG: 33, fatG: 17 },
  fries: { calories: 365, proteinG: 4, carbsG: 48, fatG: 17 },
  pudding: { calories: 150, proteinG: 3, carbsG: 25, fatG: 4 },
  chocolate: { calories: 210, proteinG: 2, carbsG: 23, fatG: 13 },
  'ice cream': { calories: 273, proteinG: 4.6, carbsG: 31, fatG: 14.5 },
  cereal: { calories: 200, proteinG: 6, carbsG: 37, fatG: 3 },
  'peanut butter': { calories: 190, proteinG: 7, carbsG: 7, fatG: 16 },
  butter: { calories: 100, proteinG: 0.1, carbsG: 0, fatG: 11 },
  'olive oil': { calories: 120, proteinG: 0, carbsG: 0, fatG: 14 },
  almonds: { calories: 165, proteinG: 6, carbsG: 6, fatG: 14 },
  nuts: { calories: 170, proteinG: 5, carbsG: 6, fatG: 15 },
  'protein shake': { calories: 120, proteinG: 24, carbsG: 3, fatG: 1 },
  'protein bar': { calories: 200, proteinG: 20, carbsG: 20, fatG: 7 },
  tofu: { calories: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8 },
  beans: { calories: 227, proteinG: 15, carbsG: 41, fatG: 0.9 },
  lentils: { calories: 230, proteinG: 18, carbsG: 40, fatG: 0.8 },
  quinoa: { calories: 222, proteinG: 8, carbsG: 39, fatG: 3.6 },
  spinach: { calories: 7, proteinG: 0.9, carbsG: 1.1, fatG: 0.1 },
  tomato: { calories: 22, proteinG: 1, carbsG: 4.8, fatG: 0.2 },
  cucumber: { calories: 16, proteinG: 0.7, carbsG: 3.8, fatG: 0.1 },
  steak: { calories: 271, proteinG: 25, carbsG: 0, fatG: 19 },
  bacon: { calories: 90, proteinG: 6, carbsG: 0.3, fatG: 7 },
  sausage: { calories: 150, proteinG: 6, carbsG: 1, fatG: 13 },
  ham: { calories: 60, proteinG: 10, carbsG: 1, fatG: 2 },
  turkey: { calories: 189, proteinG: 29, carbsG: 0, fatG: 7 },
  shrimp: { calories: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3 },
  tuna: { calories: 116, proteinG: 26, carbsG: 0, fatG: 0.8 },
  soup: { calories: 120, proteinG: 4, carbsG: 20, fatG: 2 },
  sandwich: { calories: 350, proteinG: 15, carbsG: 40, fatG: 14 },
  wrap: { calories: 320, proteinG: 14, carbsG: 38, fatG: 12 },
  burrito: { calories: 450, proteinG: 18, carbsG: 55, fatG: 16 },
  taco: { calories: 170, proteinG: 8, carbsG: 13, fatG: 9 },
  sushi: { calories: 250, proteinG: 9, carbsG: 38, fatG: 6 },
  noodles: { calories: 220, proteinG: 7, carbsG: 43, fatG: 2 },
  dumplings: { calories: 300, proteinG: 10, carbsG: 40, fatG: 10 },
  coffee: { calories: 2, proteinG: 0.3, carbsG: 0, fatG: 0 },
  latte: { calories: 120, proteinG: 6, carbsG: 12, fatG: 4 },
  juice: { calories: 110, proteinG: 0.5, carbsG: 26, fatG: 0.2 },
  soda: { calories: 150, proteinG: 0, carbsG: 39, fatG: 0 },
  beer: { calories: 150, proteinG: 1.6, carbsG: 13, fatG: 0 },
  wine: { calories: 125, proteinG: 0.1, carbsG: 4, fatG: 0 },
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface FoodMatch {
  key: string;
  nutrition: FoodNutrition;
}

export function matchFoods(text: string): FoodMatch[] {
  const lower = text.toLowerCase();
  const keys = Object.keys(FOOD_DB).sort((a, b) => b.length - a.length);
  const takenRanges: Array<[number, number]> = [];
  const matches: FoodMatch[] = [];

  for (const key of keys) {
    const re = new RegExp(`\\b${escapeRegex(key)}\\b`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(lower))) {
      const start = m.index;
      const end = start + key.length;
      const overlaps = takenRanges.some(([s, e]) => start < e && end > s);
      if (!overlaps) {
        takenRanges.push([start, end]);
        matches.push({ key, nutrition: FOOD_DB[key] });
      }
    }
  }

  return matches;
}
