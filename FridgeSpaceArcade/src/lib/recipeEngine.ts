import { FridgeItem } from '@/types/fridge';
import { MealLog, RecipeNutrition, RecipeSuggestion, UserPreferences } from '@/types/app';

interface IngredientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipeTemplate {
  id: string;
  name: string;
  image: string;
  description: string;
  baseIngredients: string[];
  optional: string[];
  tags: string[];
  dietTags: UserPreferences['dietType'][];
  baseTime: number;
  difficulty: 'easy' | 'medium';
  steps: string[];
}

const DEFAULT_NUTRITION: IngredientInfo = { calories: 80, protein: 3, carbs: 9, fat: 2 };

const DB: Record<string, IngredientInfo> = {
  tomato: { calories: 18, protein: 1, carbs: 4, fat: 0 },
  onion: { calories: 40, protein: 1, carbs: 9, fat: 0 },
  garlic: { calories: 149, protein: 6, carbs: 33, fat: 1 },
  mushroom: { calories: 22, protein: 3, carbs: 3, fat: 0 },
  spinach: { calories: 23, protein: 3, carbs: 4, fat: 0 },
  broccoli: { calories: 34, protein: 3, carbs: 7, fat: 0 },
  carrot: { calories: 41, protein: 1, carbs: 10, fat: 0 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0 },
  cucumber: { calories: 15, protein: 1, carbs: 4, fat: 0 },
  pepper: { calories: 20, protein: 1, carbs: 5, fat: 0 },
  milk: { calories: 61, protein: 3, carbs: 5, fat: 3 },
  cheese: { calories: 402, protein: 25, carbs: 1, fat: 33 },
  egg: { calories: 155, protein: 13, carbs: 1, fat: 11 },
  yogurt: { calories: 59, protein: 10, carbs: 4, fat: 0 },
  butter: { calories: 717, protein: 1, carbs: 0, fat: 81 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3 },
  rice: { calories: 130, protein: 3, carbs: 28, fat: 0 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1 },
  noodle: { calories: 138, protein: 5, carbs: 25, fat: 2 },
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
  bacon: { calories: 541, protein: 37, carbs: 1, fat: 42 },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15 },
  lemon: { calories: 29, protein: 1, carbs: 9, fat: 0 },
  chickpea: { calories: 164, protein: 9, carbs: 27, fat: 3 },
  beans: { calories: 127, protein: 9, carbs: 23, fat: 0 },
};

const recipeTemplates: RecipeTemplate[] = [
  {
    id: 'fridge-rescue-omelette',
    name: 'Fridge Rescue Omelette',
    image: '🍳',
    baseIngredients: ['egg'],
    optional: ['cheese', 'onion', 'tomato', 'mushroom', 'spinach', 'pepper'],
    tags: ['breakfast', 'high-protein'],
    dietTags: ['anything', 'vegetarian', 'high-protein', 'keto'],
    baseTime: 12,
    difficulty: 'easy',
    description: 'Fast, high-protein, and built for using up vegetables before they go bad.',
    steps: [
      'Whisk the eggs with salt and pepper.',
      'Cook chopped vegetables until softened.',
      'Pour in the eggs, add cheese if using, and fold until just set.',
    ],
  },
  {
    id: 'creamy-pantry-pasta',
    name: 'Creamy Pantry Pasta',
    image: '🍝',
    baseIngredients: ['pasta', 'garlic'],
    optional: ['tomato', 'cheese', 'milk', 'mushroom', 'spinach', 'broccoli'],
    tags: ['comfort'],
    dietTags: ['anything', 'vegetarian'],
    baseTime: 22,
    difficulty: 'medium',
    description: 'A quick pasta that makes the most of fridge vegetables and pantry staples.',
    steps: [
      'Boil pasta until al dente.',
      'Cook garlic and vegetables, then loosen with milk or pasta water.',
      'Toss together and finish with cheese if wanted.',
    ],
  },
  {
    id: 'smart-stir-fry-bowl',
    name: 'Smart Stir-Fry Bowl',
    image: '🥗',
    baseIngredients: ['rice', 'onion'],
    optional: ['broccoli', 'carrot', 'pepper', 'egg', 'chicken', 'mushroom'],
    tags: ['balanced', 'meal-prep'],
    dietTags: ['anything', 'vegetarian', 'high-protein'],
    baseTime: 20,
    difficulty: 'easy',
    description: 'Balanced and flexible, with room to lean higher-protein when you need it.',
    steps: [
      'Cook or reheat the rice.',
      'Stir-fry onion, vegetables, and protein until cooked through.',
      'Combine with rice and season to taste.',
    ],
  },
  {
    id: 'mediterranean-power-plate',
    name: 'Mediterranean Power Plate',
    image: '🥒',
    baseIngredients: ['tomato', 'cucumber'],
    optional: ['chickpea', 'cheese', 'fish', 'lemon', 'avocado', 'onion'],
    tags: ['fresh', 'meal-prep'],
    dietTags: ['anything', 'vegetarian', 'vegan', 'mediterranean', 'high-protein'],
    baseTime: 14,
    difficulty: 'easy',
    description: 'Fresh, bright, and one of the easiest ways to use raw produce without overcooking it.',
    steps: [
      'Chop the vegetables into bite-sized pieces.',
      'Add chickpeas, fish, or cheese depending on what you have.',
      'Finish with lemon and toss well.',
    ],
  },
  {
    id: 'keto-fridge-skillet',
    name: 'Keto Fridge Skillet',
    image: '🍳',
    baseIngredients: ['egg', 'cheese'],
    optional: ['bacon', 'chicken', 'spinach', 'mushroom', 'butter'],
    tags: ['keto', 'high-protein'],
    dietTags: ['anything', 'high-protein', 'keto'],
    baseTime: 16,
    difficulty: 'easy',
    description: 'A low-carb skillet that stays protein-forward without blowing up carbs.',
    steps: [
      'Brown the protein and vegetables in a hot pan.',
      'Add eggs and cheese to bring everything together.',
      'Cook until golden and serve immediately.',
    ],
  },
  {
    id: 'soup-from-the-shelf',
    name: 'Soup from the Shelf',
    image: '🍲',
    baseIngredients: ['onion', 'garlic'],
    optional: ['carrot', 'potato', 'broccoli', 'spinach', 'milk'],
    tags: ['comfort', 'light'],
    dietTags: ['anything', 'vegetarian', 'vegan'],
    baseTime: 26,
    difficulty: 'medium',
    description: 'A flexible soup for using vegetables that are close to their last good day.',
    steps: [
      'Cook onion and garlic until fragrant.',
      'Add the remaining vegetables and simmer until tender.',
      'Blend if you want it smooth, or keep it chunky.',
    ],
  },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeIngredient(name: string) {
  const lower = name.toLowerCase();
  const keys = Object.keys(DB);
  const direct = keys.find((k) => lower.includes(k));
  return direct ?? lower.split(' ')[0];
}

function roundNutrition(n: RecipeNutrition): RecipeNutrition {
  return {
    calories: Math.round(n.calories),
    protein: Math.round(n.protein),
    carbs: Math.round(n.carbs),
    fat: Math.round(n.fat),
  };
}

function addNutrition(a: RecipeNutrition, b: RecipeNutrition): RecipeNutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

function subtractNutrition(a: RecipeNutrition, b: RecipeNutrition): RecipeNutrition {
  return {
    calories: a.calories - b.calories,
    protein: a.protein - b.protein,
    carbs: a.carbs - b.carbs,
    fat: a.fat - b.fat,
  };
}

function getMealTotalsForToday(meals: MealLog[]): RecipeNutrition {
  return meals
    .filter((meal) => meal.eatenAt.slice(0, 10) === todayKey())
    .reduce(
      (acc, meal) => addNutrition(acc, meal.nutrition),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}

function getRemainingNutrition(prefs: UserPreferences, meals: MealLog[]): RecipeNutrition {
  return subtractNutrition(
    {
      calories: prefs.dailyCalories,
      protein: prefs.proteinTarget,
      carbs: prefs.carbTarget,
      fat: prefs.fatTarget,
    },
    getMealTotalsForToday(meals)
  );
}

function respectsDiet(ingredientNames: string[], prefs: UserPreferences) {
  const normalized = ingredientNames.map(normalizeIngredient);
  if (prefs.dislikedIngredients.some((d) => normalized.includes(normalizeIngredient(d)))) return false;

  if (prefs.dietType === 'vegetarian') {
    return !normalized.some((n) => ['chicken', 'fish', 'salmon', 'beef', 'bacon'].includes(n));
  }
  if (prefs.dietType === 'vegan') {
    return !normalized.some((n) => ['egg', 'cheese', 'milk', 'yogurt', 'butter', 'fish', 'salmon', 'chicken', 'beef', 'bacon'].includes(n));
  }
  if (prefs.dietType === 'keto') {
    return !normalized.some((n) => ['pasta', 'rice', 'bread', 'potato', 'chickpea', 'beans'].includes(n));
  }
  return true;
}

function sumNutrition(names: string[]): RecipeNutrition {
  return roundNutrition(
    names.reduce(
      (acc, name) => {
        const info = DB[normalizeIngredient(name)] ?? DEFAULT_NUTRITION;
        acc.calories += info.calories;
        acc.protein += info.protein;
        acc.carbs += info.carbs;
        acc.fat += info.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  );
}

function macroOverflowPenalty(nutrition: RecipeNutrition, remaining: RecipeNutrition) {
  const calorieOverflow = Math.max(0, nutrition.calories - Math.max(remaining.calories, 0));
  const carbOverflow = Math.max(0, nutrition.carbs - Math.max(remaining.carbs, 0));
  const fatOverflow = Math.max(0, nutrition.fat - Math.max(remaining.fat, 0));
  return calorieOverflow * 0.18 + carbOverflow * 2.4 + fatOverflow * 2.1;
}

function macroNeedScore(nutrition: RecipeNutrition, remaining: RecipeNutrition) {
  const proteinNeed = Math.max(remaining.protein, 0);
  const calorieNeed = Math.max(remaining.calories, 0);
  const carbNeed = Math.max(remaining.carbs, 0);
  const fatNeed = Math.max(remaining.fat, 0);

  const proteinScore = proteinNeed > 0 ? Math.min(nutrition.protein / proteinNeed, 1) * 45 : nutrition.protein * 0.3;
  const calorieScore = calorieNeed > 0 ? Math.min(nutrition.calories / calorieNeed, 1) * 25 : Math.max(0, 20 - nutrition.calories * 0.03);
  const carbScore = carbNeed > 0 ? Math.min(nutrition.carbs / carbNeed, 1) * 15 : Math.max(0, 12 - nutrition.carbs * 0.8);
  const fatScore = fatNeed > 0 ? Math.min(nutrition.fat / fatNeed, 1) * 15 : Math.max(0, 12 - nutrition.fat * 0.7);

  return proteinScore + calorieScore + carbScore + fatScore;
}

function buildReason(used: string[], missing: string[], remaining: RecipeNutrition, nutrition: RecipeNutrition) {
  const reasons: string[] = [];

  if (used.length >= 4) {
    reasons.push(`uses ${used.length} ingredients already in your fridge`);
  } else if (used.length > 0) {
    reasons.push(`built around ${used.join(', ')}`);
  }

  if (remaining.protein > 0 && nutrition.protein >= remaining.protein * 0.35) {
    reasons.push('helps close your remaining protein gap');
  }

  if (remaining.carbs <= 0 && nutrition.carbs <= 20) {
    reasons.push('keeps carbs controlled');
  }

  if (remaining.calories <= 0 && nutrition.calories <= 350) {
    reasons.push('stays lighter since you are already near your calorie target');
  }

  if (missing.length === 0) {
    reasons.push('needs no extra shopping');
  }

  return reasons.slice(0, 2).join(' · ') || 'balanced against your remaining macros';
}

function createFallbackRecipe(inventory: string[], prefs: UserPreferences, remaining: RecipeNutrition): RecipeSuggestion {
  const fallbackIngredients = inventory.slice(0, 5);
  const fallbackNutrition = sumNutrition(fallbackIngredients);
  return {
    id: 'fallback-smarty-bowl',
    name: 'Smarty Flex Bowl',
    image: '🥣',
    description: 'A flexible fallback that mixes whatever is left in your fridge into one quick meal.',
    cookTime: Math.min(prefs.maxCookTime, 18),
    prepTime: Math.max(8, Math.min(prefs.maxCookTime, 18) - 5),
    difficulty: 'easy',
    matchScore: 72,
    ingredientsUsed: fallbackIngredients,
    missingIngredients: [],
    reason: buildReason(fallbackIngredients, [], remaining, fallbackNutrition),
    steps: [
      'Chop the ingredients into evenly sized pieces.',
      'Cook the heartier ingredients first, then add anything delicate.',
      'Season well and serve as a bowl, scramble, or skillet depending on what fits best.',
    ],
    nutrition: fallbackNutrition,
    tags: ['flex', 'fridge-first'],
  };
}

export function generateRecipes(items: FridgeItem[], prefs: UserPreferences, meals: MealLog[] = []): RecipeSuggestion[] {
  const inventory = Array.from(new Set(items.map((item) => normalizeIngredient(item.name))));
  const remaining = getRemainingNutrition(prefs, meals);

  if (inventory.length === 0) return [];

  const suggestions = recipeTemplates
    .filter((template) => template.dietTags.includes(prefs.dietType) || prefs.dietType === 'anything')
    .map((template) => {
      const availableBase = template.baseIngredients.filter((name) => inventory.includes(name));
      const optionalAvailable = template.optional.filter((name) => inventory.includes(name));
      const missingBase = template.baseIngredients.filter((name) => !inventory.includes(name));
      const used = Array.from(new Set([...availableBase, ...optionalAvailable]));
      const allIngredients = Array.from(new Set([...template.baseIngredients, ...optionalAvailable]));

      if (!respectsDiet(allIngredients, prefs)) return null;
      if (used.length === 0) return null;

      const nutrition = sumNutrition(Array.from(new Set([...used, ...missingBase.slice(0, 1)])));
      const overflowPenalty = macroOverflowPenalty(nutrition, remaining);
      if (overflowPenalty > 55) return null;

      const baseCoverage = availableBase.length / template.baseIngredients.length;
      const inventoryCoverage = used.length / Math.max(template.baseIngredients.length + template.optional.length, 1);
      const macroScore = macroNeedScore(nutrition, remaining);
      const timePenalty = Math.max(0, template.baseTime - prefs.maxCookTime) * 2.5;
      const rawScore = baseCoverage * 42 + inventoryCoverage * 18 + macroScore - overflowPenalty - timePenalty;
      const matchScore = Math.max(35, Math.min(98, Math.round(rawScore)));

      return {
        id: template.id,
        name: template.name,
        image: template.image,
        description: template.description,
        cookTime: template.baseTime,
        prepTime: Math.max(5, template.baseTime - 4),
        difficulty: template.difficulty,
        matchScore,
        ingredientsUsed: used,
        missingIngredients: missingBase,
        reason: buildReason(used, missingBase, remaining, nutrition),
        steps: template.steps,
        nutrition,
        tags: template.tags,
      } satisfies RecipeSuggestion;
    })
    .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  if (suggestions.length === 0) {
    return [createFallbackRecipe(inventory, prefs, remaining)];
  }

  return suggestions;
}