export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'veryActive';

export type GoalDirection = 'lose' | 'maintain' | 'gain';

export type UnitSystem = 'metric' | 'imperial';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  units: UnitSystem;
  createdAt: string;
}

export interface Targets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  goalDirection: GoalDirection;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  id: string;
  dateISO: string; // yyyy-mm-dd
  createdAt: string;
  source: 'text' | 'photo' | 'manual';
  description: string;
  photoUri?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  items?: string[];
}

export interface WeightEntry {
  id: string;
  dateISO: string;
  weightKg: number;
}

export interface WaterEntry {
  dateISO: string;
  ml: number;
}

export interface FavoriteMeal {
  id: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface ProgressPhoto {
  uri: string;
  dateISO: string;
  weightKg: number;
}

export interface AppState {
  profile: Profile | null;
  targets: Targets | null;
  meals: Meal[];
  weightLog: WeightEntry[];
  water: WaterEntry[];
  favorites: FavoriteMeal[];
  photoScanDates: string[];
  beforePhoto: ProgressPhoto | null;
  afterPhoto: ProgressPhoto | null;
  isPro: boolean;
  onboardingComplete: boolean;
}
