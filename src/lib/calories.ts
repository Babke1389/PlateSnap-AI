import { ActivityLevel, GoalDirection, Profile, Sex, Targets } from './types';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly active (1-3 days/week)',
  moderate: 'Moderately active (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  veryActive: 'Very active (athlete / physical job)',
};

// Mifflin-St Jeor equation
export function calcBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activityLevel];
}

function goalDirectionFor(currentKg: number, goalKg: number): GoalDirection {
  const diff = goalKg - currentKg;
  if (Math.abs(diff) < 0.5) return 'maintain';
  return diff < 0 ? 'lose' : 'gain';
}

export function calcTargets(profile: Profile): Targets {
  const { sex, weightKg, heightCm, age, activityLevel, goalWeightKg } = profile;
  const bmr = calcBMR(sex, weightKg, heightCm, age);
  const tdee = calcTDEE(bmr, activityLevel);
  const goalDirection = goalDirectionFor(weightKg, goalWeightKg);

  let calorieTarget = tdee;
  if (goalDirection === 'lose') {
    // ~0.45kg/week loss, capped so we never drop below a safe floor
    calorieTarget = tdee - 500;
    const floor = sex === 'male' ? 1500 : 1200;
    calorieTarget = Math.max(calorieTarget, floor);
  } else if (goalDirection === 'gain') {
    calorieTarget = tdee + 350;
  }

  calorieTarget = Math.round(calorieTarget);

  // Macro split: protein prioritized by bodyweight, remainder split carbs/fat
  const proteinG = Math.round(weightKg * 1.8);
  const proteinCals = proteinG * 4;
  const fatCals = calorieTarget * 0.28;
  const fatG = Math.round(fatCals / 9);
  const carbsCals = Math.max(calorieTarget - proteinCals - fatCals, 0);
  const carbsG = Math.round(carbsCals / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    goalDirection,
    proteinG,
    carbsG,
    fatG,
  };
}

export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches - ft * 12);
  return { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return (ft * 12 + inch) * 2.54;
}

/**
 * Formats a Date as a YYYY-MM-DD string using its LOCAL calendar date —
 * never use `.toISOString().slice(0, 10)` for this, since that converts to
 * UTC first and silently shifts the date back a day for any timezone ahead
 * of UTC (i.e. most of Europe, Asia, Australia).
 */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toLocalISODate(new Date());
}

export function addDaysISO(dateISO: string, delta: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return toLocalISODate(d);
}

export function formatDayLabel(dateISO: string): string {
  const today = todayISO();
  if (dateISO === today) return 'Today';
  if (dateISO === addDaysISO(today, -1)) return 'Yesterday';
  return new Date(dateISO + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Monday-first list of the 7 ISO dates in the week containing `dateISO`. */
export function weekDatesISO(dateISO: string): string[] {
  const ref = new Date(dateISO + 'T00:00:00');
  const day = ref.getDay(); // 0 = Sun ... 6 = Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toLocalISODate(d);
  });
}
