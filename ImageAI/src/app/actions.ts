'use server';

import { identifyFridgeContents } from '@/ai/flows/identify-fridge-contents';
import { z } from 'zod';

const actionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/'),
});

export async function identifyItems(input: { photoDataUri: string }) {
  try {
    const validatedInput = actionSchema.safeParse(input);
    if (!validatedInput.success) {
      return { success: false, error: 'Invalid image data URI.' };
    }
    
    const result = await identifyFridgeContents(validatedInput.data);
    return { success: true, data: result.items };
  } catch (error) {
    console.error('Error identifying fridge contents:', error);
    return { success: false, error: 'Failed to identify items. Please try again.' };
  }
}
