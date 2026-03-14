import { MealLog } from '@/types/app';

const MEALS_KEY = 'smarty-meal-logs';

export function loadMeals(): MealLog[] {
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMeals(meals: MealLog[]) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}
