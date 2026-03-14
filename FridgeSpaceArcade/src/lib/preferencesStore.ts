import { UserPreferences } from '@/types/app';

const PREFS_KEY = 'smarty-user-preferences';

export const defaultPreferences: UserPreferences = {
  dailyCalories: 2200,
  proteinTarget: 140,
  carbTarget: 240,
  fatTarget: 70,
  dietType: 'anything',
  restrictions: [],
  dislikedIngredients: [],
  maxCookTime: 30,
  goal: 'maintain',
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: UserPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
