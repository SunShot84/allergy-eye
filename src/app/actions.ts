"use server";

import { identifyAllergensFromImage } from "@/ai/flows/identify-allergens-from-image";
import type { IdentifyAllergensFromImageOutput } from "@/ai/flows/identify-allergens-from-image";
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types";


export interface AllergenAnalysisResult {
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[];
  foodDescription?: string; // Future enhancement: AI could describe the food
}

export async function analyzeFoodImage(
  photoDataUri: string,
  userKnownAllergiesArray: string[]
): Promise<AllergenAnalysisResult> {
  try {
    const knownAllergiesString = userKnownAllergiesArray.join(', ');

    // Step 1: Identify allergens from image
    const identificationResult: IdentifyAllergensFromImageOutput = await identifyAllergensFromImage({
      photoDataUri,
      knownAllergies: knownAllergiesString,
    });
    
    const identifiedAllergens = identificationResult.allergens.map(a => ({
        allergen: a.allergen,
        confidence: parseFloat(a.confidence.toFixed(2)) // Ensure confidence is a number and formatted
    }));


    // Step 2: Prioritize allergens based on user profile
    const prioritizationResult: PrioritizeAllergensOutput = await prioritizeAllergens({
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    });

    return {
      identifiedAllergens: identifiedAllergens,
      prioritizedAllergens: prioritizationResult.prioritizedAllergens,
    };
  } catch (error) {
    console.error("Error in analyzeFoodImage server action:", error);
    // It's better to throw a more specific error or return an error object
    // For now, re-throwing the original error
    throw error;
  }
}
