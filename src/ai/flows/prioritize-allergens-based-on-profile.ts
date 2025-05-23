'use server';
/**
 * @fileOverview Prioritizes identified allergens based on the user's personal allergy profile.
 *
 * - prioritizeAllergens - A function that prioritizes allergens based on the user profile.
 * - PrioritizeAllergensInput - The input type for the prioritizeAllergens function.
 * - PrioritizeAllergensOutput - The return type for the prioritizeAllergens function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeAllergensInputSchema = z.object({
  identifiedAllergens: z
    .array(z.string())
    .describe('A list of allergens identified in the food image.'),
  userAllergies: z
    .array(z.string())
    .describe('A list of allergens the user is allergic to.'),
});
export type PrioritizeAllergensInput = z.infer<typeof PrioritizeAllergensInputSchema>;

const PrioritizeAllergensOutputSchema = z.object({
  prioritizedAllergens: z
    .array(z.string())
    .describe(
      'A list of allergens, with those matching the userAllergies listed first.'
    ),
});
export type PrioritizeAllergensOutput = z.infer<typeof PrioritizeAllergensOutputSchema>;

export async function prioritizeAllergens(
  input: PrioritizeAllergensInput
): Promise<PrioritizeAllergensOutput> {
  return prioritizeAllergensFlow(input);
}

const prioritizeAllergensFlow = ai.defineFlow(
  {
    name: 'prioritizeAllergensFlow',
    inputSchema: PrioritizeAllergensInputSchema,
    outputSchema: PrioritizeAllergensOutputSchema,
  },
  async input => {
    const {
      identifiedAllergens,
      userAllergies,
    } = input;

    // Prioritize allergens based on user profile
    const prioritizedAllergens = identifiedAllergens.sort((a, b) => {
      const aIsUserAllergy = userAllergies.includes(a);
      const bIsUserAllergy = userAllergies.includes(b);

      if (aIsUserAllergy && !bIsUserAllergy) {
        return -1; // a comes first
      } else if (!aIsUserAllergy && bIsUserAllergy) {
        return 1; // b comes first
      } else {
        return 0; // no change in order
      }
    });

    return {prioritizedAllergens};
  }
);
