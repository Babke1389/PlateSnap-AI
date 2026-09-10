import React, { createContext, useContext, useState } from 'react';
import { ActivityLevel, Sex, UnitSystem } from './types';

export interface OnboardingDraft {
  sex: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  goalWeightKg: string;
  activityLevel: ActivityLevel;
  units: UnitSystem;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  sex: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  goalWeightKg: '',
  activityLevel: 'moderate',
  units: 'metric',
};

interface Ctx {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);
  const update = (patch: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  return <OnboardingContext.Provider value={{ draft, update }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
