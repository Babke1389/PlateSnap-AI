import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { calcTargets, toLocalISODate, todayISO } from './calories';
import { loadState, saveState } from './storage';
import {
  AppState,
  FavoriteMeal,
  Meal,
  Profile,
  ProgressPhoto,
  Reminder,
  WaterEntry,
  WeightEntry,
  Workout,
  WorkoutType,
} from './types';

const EMPTY_STATE: AppState = {
  profile: null,
  targets: null,
  meals: [],
  weightLog: [],
  water: [],
  workouts: [],
  reminders: [],
  favorites: [],
  photoScanDates: [],
  beforePhoto: null,
  afterPhoto: null,
  isPro: false,
  trialEndsAt: null,
  onboardingComplete: false,
};

const TRIAL_DAYS = 7;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Store extends AppState {
  isLoading: boolean;
  completeOnboarding: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'dateISO'> & { dateISO?: string }) => void;
  removeMeal: (id: string) => void;
  addWater: (ml: number, dateISO?: string) => void;
  addWeightEntry: (weightKg: number, dateISO?: string) => void;
  setPro: (value: boolean) => void;
  startTrial: () => void;
  resetAll: () => void;
  mealsForDate: (dateISO: string) => Meal[];
  totalsForDate: (dateISO: string) => { calories: number; proteinG: number; carbsG: number; fatG: number };
  waterForDate: (dateISO: string) => number;
  streakDays: () => number;
  photoScansToday: () => number;
  recordPhotoScan: () => void;
  addFavorite: (favorite: Omit<FavoriteMeal, 'id'>) => void;
  removeFavorite: (id: string) => void;
  logFavorite: (favorite: FavoriteMeal, dateISO?: string) => void;
  setProgressPhoto: (which: 'before' | 'after', uri: string) => void;
  clearProgressPhoto: (which: 'before' | 'after') => void;
  addWorkout: (type: WorkoutType, durationMin: number, dateISO?: string) => void;
  removeWorkout: (id: string) => void;
  workoutsForDate: (dateISO: string) => Workout[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Reminder;
  removeReminder: (id: string) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadState();
      if (loaded) setState({ ...EMPTY_STATE, ...loaded });
      hydrated.current = true;
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveState(state);
  }, [state]);

  const completeOnboarding = (profile: Profile) => {
    const targets = calcTargets(profile);
    setState((s) => ({
      ...s,
      profile,
      targets,
      onboardingComplete: true,
      weightLog: [{ id: uid(), dateISO: todayISO(), weightKg: profile.weightKg }],
    }));
  };

  const updateProfile = (profile: Profile) => {
    const targets = calcTargets(profile);
    setState((s) => ({ ...s, profile, targets }));
  };

  const addMeal: Store['addMeal'] = (meal) => {
    const newMeal: Meal = {
      ...meal,
      id: uid(),
      createdAt: new Date().toISOString(),
      dateISO: meal.dateISO ?? todayISO(),
    };
    setState((s) => ({ ...s, meals: [newMeal, ...s.meals] }));
  };

  const removeMeal = (id: string) => {
    setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));
  };

  const addWater: Store['addWater'] = (ml, dateISO = todayISO()) => {
    setState((s) => {
      const existing = s.water.find((w) => w.dateISO === dateISO);
      let water: WaterEntry[];
      if (existing) {
        water = s.water.map((w) =>
          w.dateISO === dateISO ? { ...w, ml: Math.max(w.ml + ml, 0) } : w
        );
      } else {
        water = [...s.water, { dateISO, ml: Math.max(ml, 0) }];
      }
      return { ...s, water };
    });
  };

  const addWeightEntry: Store['addWeightEntry'] = (weightKg, dateISO = todayISO()) => {
    setState((s) => {
      const entry: WeightEntry = { id: uid(), dateISO, weightKg };
      const weightLog = [...s.weightLog.filter((w) => w.dateISO !== dateISO), entry].sort((a, b) =>
        a.dateISO.localeCompare(b.dateISO)
      );
      const profile = s.profile ? { ...s.profile, weightKg } : s.profile;
      const targets = profile ? calcTargets(profile) : s.targets;
      return { ...s, weightLog, profile, targets };
    });
  };

  const setPro = (value: boolean) =>
    setState((s) => ({ ...s, isPro: value, trialEndsAt: value ? s.trialEndsAt : null }));

  const startTrial = () => {
    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    setState((s) => ({ ...s, isPro: true, trialEndsAt }));
  };

  const resetAll = () => setState(EMPTY_STATE);

  const mealsForDate = (dateISO: string) => state.meals.filter((m) => m.dateISO === dateISO);

  const totalsForDate = (dateISO: string) => {
    const meals = mealsForDate(dateISO);
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        proteinG: acc.proteinG + m.proteinG,
        carbsG: acc.carbsG + m.carbsG,
        fatG: acc.fatG + m.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  };

  const waterForDate = (dateISO: string) => state.water.find((w) => w.dateISO === dateISO)?.ml ?? 0;

  const streakDays = () => {
    const daysWithMeals = new Set(state.meals.map((m) => m.dateISO));
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const iso = toLocalISODate(cursor);
      if (daysWithMeals.has(iso)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const photoScansToday = () => state.photoScanDates.filter((d) => d === todayISO()).length;

  const recordPhotoScan = () =>
    setState((s) => ({ ...s, photoScanDates: [...s.photoScanDates, todayISO()] }));

  const addFavorite: Store['addFavorite'] = (favorite) =>
    setState((s) => ({ ...s, favorites: [{ ...favorite, id: uid() }, ...s.favorites] }));

  const removeFavorite = (id: string) =>
    setState((s) => ({ ...s, favorites: s.favorites.filter((f) => f.id !== id) }));

  const logFavorite: Store['logFavorite'] = (favorite, dateISO) => {
    addMeal({
      source: 'manual',
      description: favorite.description,
      calories: favorite.calories,
      proteinG: favorite.proteinG,
      carbsG: favorite.carbsG,
      fatG: favorite.fatG,
      dateISO,
    });
  };

  const setProgressPhoto: Store['setProgressPhoto'] = (which, uri) => {
    setState((s) => {
      const photo: ProgressPhoto = {
        uri,
        dateISO: todayISO(),
        weightKg: s.profile?.weightKg ?? 0,
      };
      return which === 'before' ? { ...s, beforePhoto: photo } : { ...s, afterPhoto: photo };
    });
  };

  const clearProgressPhoto: Store['clearProgressPhoto'] = (which) => {
    setState((s) => (which === 'before' ? { ...s, beforePhoto: null } : { ...s, afterPhoto: null }));
  };

  const addWorkout: Store['addWorkout'] = (type, durationMin, dateISO = todayISO()) => {
    const workout: Workout = {
      id: uid(),
      dateISO,
      createdAt: new Date().toISOString(),
      type,
      durationMin,
    };
    setState((s) => ({ ...s, workouts: [workout, ...s.workouts] }));
  };

  const removeWorkout = (id: string) =>
    setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) }));

  const workoutsForDate = (dateISO: string) => state.workouts.filter((w) => w.dateISO === dateISO);

  const addReminder: Store['addReminder'] = (reminder) => {
    const withId: Reminder = { ...reminder, id: uid() };
    setState((s) => ({ ...s, reminders: [...s.reminders, withId] }));
    return withId;
  };

  const removeReminder = (id: string) =>
    setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));

  const updateReminder: Store['updateReminder'] = (id, patch) =>
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const value = useMemo<Store>(
    () => ({
      ...state,
      isLoading,
      completeOnboarding,
      updateProfile,
      addMeal,
      removeMeal,
      addWater,
      addWeightEntry,
      setPro,
      startTrial,
      resetAll,
      mealsForDate,
      totalsForDate,
      waterForDate,
      streakDays,
      photoScansToday,
      recordPhotoScan,
      addFavorite,
      removeFavorite,
      logFavorite,
      setProgressPhoto,
      clearProgressPhoto,
      addWorkout,
      removeWorkout,
      workoutsForDate,
      addReminder,
      removeReminder,
      updateReminder,
    }),
    [state, isLoading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
