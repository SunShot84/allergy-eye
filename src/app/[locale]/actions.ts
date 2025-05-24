
"use server";

import OpenAI from 'openai';
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensInput, PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types";
import { getI18n } from '@/lib/i18n/server';

// Define the expected structure from OpenAI, now including sourceFoodItem
interface OpenAIAllergenInfo {
  allergen: string;
  confidence: number;
  sourceFoodItem?: string; 
}
interface OpenAIAllergenIdentificationOutput {
  allergens: OpenAIAllergenInfo[];
}

export interface AllergenAnalysisResult {
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[];
  foodDescription?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeFoodImage(
  photoDataUri: string,
  userKnownAllergiesArray: string[],
  currentLocale: 'en' | 'zh-CN' | 'zh-TW'
): Promise<AllergenAnalysisResult> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const t = await getI18n(currentLocale);

  try {
    const knownAllergiesString = userKnownAllergiesArray.join(', ') || t('profile.noAllergiesYet'); // Provide a fallback if no allergies
    let identifiedAllergens: AllergenInfo[] = [];

    const systemPromptInstruction = t('aiPrompt.systemInstruction', { locale: currentLocale });
    const jsonStructureInstruction = t('aiPrompt.jsonStructure', { locale: currentLocale });
    const userAllergyContextInstruction = t('aiPrompt.userAllergyContext', { knownAllergiesString, locale: currentLocale });
    
    const systemPrompt = `${systemPromptInstruction} ${jsonStructureInstruction} ${userAllergyContextInstruction}`;
    const userPromptText = t('aiPrompt.identifyRequest', { locale: currentLocale });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // or "gpt-4-vision-preview" if still preferred for pure vision tasks, but gpt-4-turbo is generally good
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPromptText },
            {
              type: "image_url",
              image_url: {
                url: photoDataUri,
              },
            },
          ],
        },
      ],
      max_tokens: 1000, // Increased slightly in case source descriptions are long
    });

    if (response.choices[0].message.content) {
      const openAIResult = JSON.parse(response.choices[0].message.content) as OpenAIAllergenIdentificationOutput;
      if (openAIResult.allergens && Array.isArray(openAIResult.allergens)) {
         identifiedAllergens = openAIResult.allergens.map(a => ({
           allergen: a.allergen,
           confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0,
           sourceFoodItem: a.sourceFoodItem || undefined, // Map the new field
         }));
      }
    } else {
      console.warn("OpenAI response content was null or empty.");
    }
    
    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    };
    const prioritizationResult: PrioritizeAllergensOutput = prioritizeAllergens(prioritizationInput);

    return {
      identifiedAllergens: identifiedAllergens,
      prioritizedAllergens: prioritizationResult.prioritizedAllergens,
      // foodDescription might be derivable or explicitly asked in a more complex prompt
    };
  } catch (error) {
    console.error("Error in analyzeFoodImage server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    throw new Error(`Failed to analyze food image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
