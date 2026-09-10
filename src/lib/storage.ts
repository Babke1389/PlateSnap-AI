import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from './types';

const KEY = 'calorieai:v1:state';

export async function loadState(): Promise<AppState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort local persistence; ignore write failures
  }
}
