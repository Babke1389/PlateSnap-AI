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
  source: 'text' | 'photo' | 'manual' | 'barcode';
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

export type WorkoutType = 'cardio' | 'strength';

export interface Workout {
  id: string;
  dateISO: string;
  createdAt: string;
  type: WorkoutType;
  durationMin: number;
}

export interface Reminder {
  id: string;
  label: string;
  hour: number; // 0-23, local time
  minute: number; // 0-59
  enabled: boolean;
  notificationId: string | null;
}

export type MeasurementType = 'waist' | 'chest' | 'hips' | 'arms' | 'thighs';

export interface BodyMeasurement {
  id: string;
  dateISO: string;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
}

export interface AppState {
  profile: Profile | null;
  targets: Targets | null;
  meals: Meal[];
  weightLog: WeightEntry[];
  water: WaterEntry[];
  workouts: Workout[];
  reminders: Reminder[];
  favorites: FavoriteMeal[];
  photoScanDates: string[];
  beforePhoto: ProgressPhoto | null;
  afterPhoto: ProgressPhoto | null;
  bodyMeasurements: BodyMeasurement[];
  isPro: boolean;
  trialEndsAt: string | null;
  onboardingComplete: boolean;
}
