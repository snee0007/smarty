// /lib/generaterecipe.ts

import { RecipeSuggestion } from '@/types/app';

export async function generateRecipeHandler(req: { body: any }): Promise<RecipeSuggestion[]> {
  const { prompt } = req.body;

  console.log('Prompt sent to AI:', prompt);

  // Simulate AI response — normally you'd call Gemini API here
  const inventory = prompt.match(/I have these ingredients in my fridge: (.+)\./)?.[1].split(',').map((i) => i.trim()) || [];

  const recipes: RecipeSuggestion[] = inventory.length > 0 ? inventory.map((ingredient, idx) => ({
    id: `ai-recipe-${idx + 1}`,
    name: `${ingredient} Delight`,
    image: '🍽️',
    description: `A tasty recipe featuring ${ingredient} from your fridge.`,
    prepTime: 5 + idx * 2,
    cookTime: 10 + idx * 5,
    difficulty: 'easy',  // ✅ TS-safe: 'easy' | 'medium'
    steps: [
      `Prepare the ${ingredient}.`,
      'Cook it to perfection.',
      'Serve and enjoy!',
    ],
    ingredientsUsed: [ingredient],
    missingIngredients: [],
    nutrition: { calories: 200 + idx * 50, protein: 10 + idx * 5, carbs: 20 + idx * 5, fat: 5 + idx * 2 },
    tags: ['fridge-first', 'quick'],
    matchScore: 80 - idx * 5,
    reason: `Uses ${ingredient} from your fridge`,
  })) : [];

  return recipes;
}