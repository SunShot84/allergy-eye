/**
 * @fileOverview Prioritizes identified allergens based on the user's personal allergy profile.
 *
 * - prioritizeAllergens - A function that prioritizes allergens based on the user profile.
 * - PrioritizeAllergensInput - The input type for the prioritizeAllergens function.
 * - PrioritizeAllergensOutput - The return type for the prioritizeAllergens function.
 */

import {z} from 'zod'; // Changed from 'genkit/zod'

const PrioritizeAllergensInputSchema = z.object({
  identifiedAllergens: z
    .array(z.string())
    .describe('A list of allergen IDs identified in the food image.'),
  userAllergies: z
    .array(z.string())
    .describe('A list of allergen IDs the user is allergic to.'),
});
export type PrioritizeAllergensInput = z.infer<typeof PrioritizeAllergensInputSchema>;

const PrioritizeAllergensOutputSchema = z.object({
  prioritizedAllergens: z
    .array(z.string())
    .describe(
      'A list of allergen IDs, with those matching the userAllergies listed first.'
    ),
});
export type PrioritizeAllergensOutput = z.infer<typeof PrioritizeAllergensOutputSchema>;

export function prioritizeAllergens( 
  input: PrioritizeAllergensInput
): PrioritizeAllergensOutput {
  const {
    identifiedAllergens,
    userAllergies,
  } = input;

  // Prioritize allergens based on user profile
  // Since we're now working with standardized allergen IDs, we can do direct comparison
  const prioritizedAllergens = identifiedAllergens.sort((a, b) => {
    const aIsUserAllergy = userAllergies.includes(a);
    const bIsUserAllergy = userAllergies.includes(b);

    if (aIsUserAllergy && !bIsUserAllergy) {
      return -1; // a comes first
    } else if (!aIsUserAllergy && bIsUserAllergy) {
      return 1; // b comes first
    } else {
      // If both are user allergies or neither are, sort alphabetically for consistency
      return a.localeCompare(b);
    }
  });

  return {prioritizedAllergens};
}

