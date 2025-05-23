'use server';

/**
 * @fileOverview Identifies potential allergens in an image of a food item.
 *
 * - identifyAllergensFromImage - A function that handles the allergen identification process.
 * - IdentifyAllergensFromImageInput - The input type for the identifyAllergensFromImage function.
 * - IdentifyAllergensFromImageOutput - The return type for the identifyAllergensFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyAllergensFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  knownAllergies: z
    .string()
    .describe('A comma separated list of known allergies of the user.'),
});
export type IdentifyAllergensFromImageInput = z.infer<typeof IdentifyAllergensFromImageInputSchema>;

const AllergenIdentificationSchema = z.object({
  allergen: z.string().describe('The name of the allergen.'),
  confidence: z
    .number()
    .describe('The confidence level (0-1) that the allergen is present.'),
});

const IdentifyAllergensFromImageOutputSchema = z.object({
  allergens: z
    .array(AllergenIdentificationSchema)
    .describe('A list of potential allergens identified in the image.'),
});

export type IdentifyAllergensFromImageOutput = z.infer<typeof IdentifyAllergensFromImageOutputSchema>;

export async function identifyAllergensFromImage(
  input: IdentifyAllergensFromImageInput
): Promise<IdentifyAllergensFromImageOutput> {
  return identifyAllergensFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyAllergensFromImagePrompt',
  input: {schema: IdentifyAllergensFromImageInputSchema},
  output: {schema: IdentifyAllergensFromImageOutputSchema},
  prompt: `You are an AI that identifies potential allergens in food items from images.

You will receive an image of a food item and a list of known allergies.

You will analyze the image and identify potential allergens present in the food item.
For each potential allergen, you will estimate a confidence level (0-1) that the allergen is present.

Known Allergies: {{{knownAllergies}}}

Image: {{media url=photoDataUri}}

Output the list of potential allergens, their names, and confidence levels.
`,
});

const identifyAllergensFromImageFlow = ai.defineFlow(
  {
    name: 'identifyAllergensFromImageFlow',
    inputSchema: IdentifyAllergensFromImageInputSchema,
    outputSchema: IdentifyAllergensFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
