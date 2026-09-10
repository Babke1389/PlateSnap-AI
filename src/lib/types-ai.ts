export interface MealAnalysis {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  items: string[];
  /**
   * 'ai' = real vision/language model call. 'matched' = looked up from a known-food
   * table (no AI configured). 'guessed' = no known food recognized, pure fallback guess.
   */
  confidence: 'ai' | 'matched' | 'guessed';
}
