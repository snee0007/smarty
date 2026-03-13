'use server';
/**
 * @fileOverview A Genkit flow to identify food items in a fridge image.
 *
 * - identifyFridgeContents - A function that handles the identification process.
 * - IdentifyFridgeContentsInput - The input type for the identifyFridgeContents function.
 * - IdentifyFridgeContentsOutput - The return type for the identifyFridgeContents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyFridgeContentsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a fridge's contents, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyFridgeContentsInput = z.infer<typeof IdentifyFridgeContentsInputSchema>;

const IdentifyFridgeContentsOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of food items identified in the fridge.'),
});
export type IdentifyFridgeContentsOutput = z.infer<typeof IdentifyFridgeContentsOutputSchema>;

export async function identifyFridgeContents(
  input: IdentifyFridgeContentsInput
): Promise<IdentifyFridgeContentsOutput> {
  return identifyFridgeContentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyFridgeContentsPrompt',
  input: {schema: IdentifyFridgeContentsInputSchema},
  output: {schema: IdentifyFridgeContentsOutputSchema},
  prompt: `You are an expert at identifying food items within a fridge from an image.

Analyze the provided image and list all discernible food items. Your response should be a JSON object containing a single key 'items', which is an array of strings, where each string is the name of an identified food item.

Image: {{media url=photoDataUri}}`,
});

const identifyFridgeContentsFlow = ai.defineFlow(
  {
    name: 'identifyFridgeContentsFlow',
    inputSchema: IdentifyFridgeContentsInputSchema,
    outputSchema: IdentifyFridgeContentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
