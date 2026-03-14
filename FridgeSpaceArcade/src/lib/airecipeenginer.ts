import { FridgeItem } from '@/types/fridge';
import { RecipeSuggestion, UserPreferences, MealLog } from '@/types/app';
import { generateRecipeHandler } from '@/pages/generaterecipe';

function getInventoryNames(items: FridgeItem[]) {
  return Array.from(new Set(items.map((item) => item.name.toLowerCase())));
}

export async function generateAIRecipes(
  items: FridgeItem[],
  prefs: UserPreferences,
  meals: MealLog[] = []
): Promise<RecipeSuggestion[]> {
  const inventory = getInventoryNames(items);

  if (inventory.length === 0) return [];

  const prompt = `
I have these ingredients in my fridge: ${inventory.join(', ')}.
Please suggest recipes I can make with these ingredients.
Return the result as a JSON array of recipes, each with:
id, name, image (emoji), description, prepTime, cookTime,
difficulty (easy | medium), steps (3-5 strings),
ingredientsUsed (string array),
missingIngredients (string array),
nutrition (object with calories, protein, carbs, fat),
tags (string array),
matchScore (number),
reason (string).
`;

  try {
    const recipes = await generateRecipeHandler({ body: { prompt } });
    return recipes;
  } catch (err) {
    console.error('AI recipe generation failed', err);
    return [];
  }
}