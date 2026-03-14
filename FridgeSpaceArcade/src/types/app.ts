export type DietType = 'anything' | 'vegetarian' | 'vegan' | 'high-protein' | 'keto' | 'mediterranean';
export type GoalType = 'maintain' | 'lose' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserPreferences {
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  dietType: DietType;
  restrictions: string[];
  dislikedIngredients: string[];
  maxCookTime: number;
  goal: GoalType;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeSuggestion {
  id: string;
  name: string;
  description: string;
  cookTime: number;
  difficulty: 'easy' | 'medium';
  matchScore: number;
  ingredientsUsed: string[];
  missingIngredients: string[];
  reason: string;
  steps: string[];
  nutrition: RecipeNutrition;
  tags: string[];
}

export interface MealLog {
  id: string;
  recipeId?: string;
  recipeName: string;
  mealType: MealType;
  eatenAt: string;
  nutrition: RecipeNutrition;
}
