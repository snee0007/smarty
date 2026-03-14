import { FridgeItem } from '@/types/fridge';
import { RecipeNutrition, RecipeSuggestion, UserPreferences } from '@/types/app';

interface IngredientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags?: string[];
}

const DB: Record<string, IngredientInfo> = {
  tomato: { calories: 18, protein: 1, carbs: 4, fat: 0 },
  onion: { calories: 40, protein: 1, carbs: 9, fat: 0 },
  garlic: { calories: 149, protein: 6, carbs: 33, fat: 1 },
  mushroom: { calories: 22, protein: 3, carbs: 3, fat: 0, tags: ['vegetarian', 'vegan'] },
  spinach: { calories: 23, protein: 3, carbs: 4, fat: 0, tags: ['vegetarian', 'vegan'] },
  broccoli: { calories: 34, protein: 3, carbs: 7, fat: 0 },
  carrot: { calories: 41, protein: 1, carbs: 10, fat: 0 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0 },
  cucumber: { calories: 15, protein: 1, carbs: 4, fat: 0 },
  pepper: { calories: 20, protein: 1, carbs: 5, fat: 0 },
  milk: { calories: 61, protein: 3, carbs: 5, fat: 3, tags: ['vegetarian'] },
  cheese: { calories: 402, protein: 25, carbs: 1, fat: 33, tags: ['vegetarian', 'high-protein'] },
  egg: { calories: 155, protein: 13, carbs: 1, fat: 11, tags: ['vegetarian', 'high-protein', 'keto'] },
  yogurt: { calories: 59, protein: 10, carbs: 4, fat: 0, tags: ['vegetarian', 'high-protein'] },
  butter: { calories: 717, protein: 1, carbs: 0, fat: 81, tags: ['vegetarian', 'keto'] },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3 },
  rice: { calories: 130, protein: 3, carbs: 28, fat: 0 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1 },
  noodle: { calories: 138, protein: 5, carbs: 25, fat: 2 },
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14, tags: ['high-protein', 'keto'] },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12, tags: ['high-protein', 'keto', 'mediterranean'] },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13, tags: ['high-protein', 'keto', 'mediterranean'] },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15, tags: ['high-protein', 'keto'] },
  bacon: { calories: 541, protein: 37, carbs: 1, fat: 42, tags: ['high-protein', 'keto'] },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15, tags: ['vegan', 'vegetarian', 'keto', 'mediterranean'] },
  lemon: { calories: 29, protein: 1, carbs: 9, fat: 0, tags: ['vegan', 'vegetarian'] },
  chickpea: { calories: 164, protein: 9, carbs: 27, fat: 3, tags: ['vegan', 'vegetarian', 'high-protein', 'mediterranean'] },
  beans: { calories: 127, protein: 9, carbs: 23, fat: 0, tags: ['vegan', 'vegetarian', 'high-protein'] },
};

const recipeTemplates = [
  {
    name: 'Fridge Rescue Omelette',
    baseIngredients: ['egg', 'cheese', 'onion'],
    optional: ['tomato', 'mushroom', 'spinach', 'pepper'],
    tags: ['breakfast', 'high-protein'],
    dietTags: ['anything', 'vegetarian', 'high-protein', 'keto'],
    baseTime: 12,
    description: 'A fast skillet recipe that turns scattered fridge staples into a satisfying meal.',
    steps: ['Whisk the eggs with a pinch of salt.', 'Sauté chopped vegetables until softened.', 'Pour eggs into the pan, add cheese, fold, and cook until just set.'],
  },
  {
    name: 'Creamy Pantry Pasta',
    baseIngredients: ['pasta', 'garlic'],
    optional: ['tomato', 'cheese', 'milk', 'mushroom', 'spinach', 'broccoli'],
    tags: ['comfort'],
    dietTags: ['anything', 'vegetarian'],
    baseTime: 22,
    description: 'A silky weeknight pasta built around whatever vegetables are waiting in the fridge.',
    steps: ['Boil pasta until al dente.', 'Make a quick sauce with garlic and the optional ingredients.', 'Toss pasta through the sauce and finish with extra cheese if desired.'],
  },
  {
    name: 'Smart Stir-Fry Bowl',
    baseIngredients: ['rice', 'onion'],
    optional: ['broccoli', 'carrot', 'pepper', 'egg', 'chicken', 'mushroom'],
    tags: ['balanced', 'meal-prep'],
    dietTags: ['anything', 'vegetarian', 'high-protein'],
    baseTime: 20,
    description: 'A quick bowl that is great for using vegetables before they expire.',
    steps: ['Cook the rice or warm leftover rice.', 'Stir-fry the vegetables and protein with onion.', 'Fold everything together and season to taste.'],
  },
  {
    name: 'Mediterranean Power Plate',
    baseIngredients: ['tomato', 'cucumber'],
    optional: ['chickpea', 'cheese', 'fish', 'lemon', 'avocado', 'onion'],
    tags: ['fresh', 'meal-prep'],
    dietTags: ['anything', 'vegetarian', 'vegan', 'mediterranean', 'high-protein'],
    baseTime: 14,
    description: 'A fresh high-satiety plate built around crunchy produce and bright flavors.',
    steps: ['Chop the fresh vegetables.', 'Add the protein and any creamy element.', 'Finish with lemon, herbs, and a generous toss.'],
  },
  {
    name: 'Keto Fridge Skillet',
    baseIngredients: ['egg', 'cheese'],
    optional: ['bacon', 'chicken', 'spinach', 'mushroom', 'butter'],
    tags: ['keto', 'high-protein'],
    dietTags: ['anything', 'high-protein', 'keto'],
    baseTime: 16,
    description: 'A low-carb skillet with rich protein, quick cooking vegetables, and plenty of flavor.',
    steps: ['Brown the protein and vegetables in a skillet.', 'Add eggs or cheese to bind everything together.', 'Cook until golden and serve hot.'],
  },
  {
    name: 'Soup from the Shelf',
    baseIngredients: ['onion', 'garlic'],
    optional: ['carrot', 'potato', 'broccoli', 'spinach', 'milk'],
    tags: ['comfort', 'light'],
    dietTags: ['anything', 'vegetarian', 'vegan'],
    baseTime: 26,
    description: 'A comforting soup that works brilliantly when your vegetables are close to expiry.',
    steps: ['Sauté onion and garlic in a pot.', 'Add chopped vegetables and simmer until tender.', 'Blend or leave chunky, then finish with milk if using.'],
  },
];

function normalizeIngredient(name: string) {
  const lower = name.toLowerCase();
  const keys = Object.keys(DB);
  const direct = keys.find((k) => lower.includes(k));
  return direct ?? lower.split(' ')[0];
}

function sumNutrition(names: string[]): RecipeNutrition {
  return names.reduce(
    (acc, name) => {
      const info = DB[normalizeIngredient(name)] ?? { calories: 80, protein: 3, carbs: 9, fat: 2 };
      acc.calories += info.calories;
      acc.protein += info.protein;
      acc.carbs += info.carbs;
      acc.fat += info.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function roundNutrition(n: RecipeNutrition): RecipeNutrition {
  return {
    calories: Math.round(n.calories),
    protein: Math.round(n.protein),
    carbs: Math.round(n.carbs),
    fat: Math.round(n.fat),
  };
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

function nutritionAlignment(nutrition: RecipeNutrition, prefs: UserPreferences) {
  const calorieWeight = Math.max(0, 100 - Math.abs(prefs.dailyCalories / 3 - nutrition.calories) / 4);
  const proteinWeight = Math.min(100, (nutrition.protein / Math.max(prefs.proteinTarget / 3, 1)) * 100);
  return Math.round((calorieWeight * 0.55 + proteinWeight * 0.45));
}

export function generateRecipes(items: FridgeItem[], prefs: UserPreferences): RecipeSuggestion[] {
  const inventory = Array.from(new Set(items.map((item) => normalizeIngredient(item.name))));

  const suggestions = recipeTemplates
    .filter((template) => template.dietTags.includes(prefs.dietType) || prefs.dietType === 'anything')
    .map((template) => {
      const availableBase = template.baseIngredients.filter((name) => inventory.includes(name));
      const optionalAvailable = template.optional.filter((name) => inventory.includes(name));
      const used = Array.from(new Set([...availableBase, ...optionalAvailable]));
      const missing = template.baseIngredients.filter((name) => !inventory.includes(name));
      const allIngredients = Array.from(new Set([...template.baseIngredients, ...optionalAvailable]));

      if (!respectsDiet(allIngredients, prefs)) return null;

      const nutrition = roundNutrition(sumNutrition(allIngredients));
      const ingredientCoverage = Math.round(((availableBase.length * 2 + optionalAvailable.length) / (template.baseIngredients.length * 2 + template.optional.length)) * 100);
      const score = Math.round(ingredientCoverage * 0.55 + nutritionAlignment(nutrition, prefs) * 0.35 + Math.max(0, 100 - template.baseTime * 2) * 0.1);

      return {
        id: `${template.name}-${used.join('-')}`,
        name: template.name,
        description: template.description,
        cookTime: template.baseTime,
        difficulty: template.baseTime <= 18 ? 'easy' : 'medium',
        matchScore: Math.max(48, Math.min(98, score)),
        ingredientsUsed: used,
        missingIngredients: missing,
        reason:
          missing.length === 0
            ? 'Great fit: everything important is already inside the fridge.'
            : `Mostly ready: you only need ${missing.join(', ')} to complete it.`,
        steps: template.steps,
        nutrition,
        tags: template.tags,
      } satisfies RecipeSuggestion;
    })
    .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  if (suggestions.length > 0) return suggestions;

  const fallbackIngredients = inventory.slice(0, 4);
  const nutrition = roundNutrition(sumNutrition(fallbackIngredients));
  return [
    {
      id: 'fallback-smart-salad',
      name: 'Smarty Improvised Bowl',
      description: 'A flexible recipe assembled from what is already present in your fridge.',
      cookTime: Math.min(prefs.maxCookTime, 18),
      difficulty: 'easy',
      matchScore: 72,
      ingredientsUsed: fallbackIngredients,
      missingIngredients: [],
      reason: 'No template matched perfectly, so Smarty built a flexible fallback around your current ingredients.',
      steps: ['Chop or prep your available ingredients.', 'Cook the proteins or grains if needed.', 'Combine everything into a bowl, skillet, or salad based on texture and preference.'],
      nutrition,
      tags: ['adaptive', 'smart'],
    },
  ];
}
