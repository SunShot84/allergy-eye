
"use server";

import OpenAI from 'openai';
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensInput, PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types";
import { getI18n } from '@/lib/i18n/server';

// Define the expected structure from OpenAI for food image analysis
interface OpenAIFoodAllergenInfo {
  allergen: string;
  confidence: number;
  sourceFoodItem?: string;
}
interface OpenAIFoodAllergenIdentificationOutput {
  allergens: OpenAIFoodAllergenInfo[];
}

// Define the expected structure from OpenAI for ingredients list analysis
interface OpenAIIngredientsAllergenInfo {
  allergen: string;
  confidence: number;
  sourceFoodItem?: string; // This will be the text snippet from ingredients
}
interface OpenAIIngredientsAnalysisOutput {
  extractedText: string;
  allergens: OpenAIIngredientsAllergenInfo[];
}


export interface AllergenAnalysisResult {
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[];
  foodDescription?: string; // For food scans
  extractedText?: string; // For ingredients list scans
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze Food Image (existing function, largely unchanged)
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
    const knownAllergiesString = userKnownAllergiesArray.join(', ') || t('profile.noAllergiesYet');
    let identifiedAllergens: AllergenInfo[] = [];

    const systemPromptInstruction = t('aiPrompt.systemInstruction', { locale: currentLocale });
    const jsonStructureInstruction = t('aiPrompt.jsonStructure', { locale: currentLocale });
    const userAllergyContextInstruction = t('aiPrompt.userAllergyContext', { knownAllergiesString, locale: currentLocale });

    const systemPrompt = `${systemPromptInstruction} ${jsonStructureInstruction} ${userAllergyContextInstruction}`;
    const userPromptText = t('aiPrompt.identifyRequest', { locale: currentLocale });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
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
      max_tokens: 1000,
    });

    if (response.choices[0].message.content) {
      const openAIResult = JSON.parse(response.choices[0].message.content) as OpenAIFoodAllergenIdentificationOutput;
      if (openAIResult.allergens && Array.isArray(openAIResult.allergens)) {
         identifiedAllergens = openAIResult.allergens.map(a => ({
           allergen: a.allergen,
           confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0,
           sourceFoodItem: a.sourceFoodItem || undefined,
         }));
      }
    } else {
      console.warn("OpenAI response content was null or empty for food image analysis.");
    }

    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    };
    const prioritizationResult: PrioritizeAllergensOutput = prioritizeAllergens(prioritizationInput);

    return {
      identifiedAllergens: identifiedAllergens,
      prioritizedAllergens: prioritizationResult.prioritizedAllergens,
    };
  } catch (error) {
    console.error("Error in analyzeFoodImage server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    throw new Error(`Failed to analyze food image: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// New function to analyze ingredients list image
export async function analyzeIngredientsListImage(
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
    const knownAllergiesString = userKnownAllergiesArray.join(', ') || t('profile.noAllergiesYet');
    let identifiedAllergens: AllergenInfo[] = [];
    let extractedTextResult: string = "";

    const systemPromptInstruction = t('aiPrompt.ingredientsSystemInstruction', { locale: currentLocale });
    const jsonStructureInstruction = t('aiPrompt.ingredientsJsonStructure', { locale: currentLocale });
    const userAllergyContextInstruction = t('aiPrompt.ingredientsUserAllergyContext', { knownAllergiesString, locale: currentLocale });

    const systemPrompt = `${systemPromptInstruction} ${jsonStructureInstruction} ${userAllergyContextInstruction}`;
    const userPromptText = t('aiPrompt.ingredientsIdentifyRequest', { locale: currentLocale });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14", // Vision model that can do OCR
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
      max_tokens: 1500, // Increased for potentially long ingredients lists and extracted text
    });

    if (response.choices[0].message.content) {
      const openAIResult = JSON.parse(response.choices[0].message.content) as OpenAIIngredientsAnalysisOutput;
      extractedTextResult = openAIResult.extractedText || "";
      if (openAIResult.allergens && Array.isArray(openAIResult.allergens)) {
         identifiedAllergens = openAIResult.allergens.map(a => ({
           allergen: a.allergen,
           confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0,
           sourceFoodItem: a.sourceFoodItem || undefined, // This will be the text snippet
         }));
      }
    } else {
      console.warn("OpenAI response content was null or empty for ingredients list analysis.");
    }

    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    };
    const prioritizationResult: PrioritizeAllergensOutput = prioritizeAllergens(prioritizationInput);

    return {
      identifiedAllergens: identifiedAllergens,
      prioritizedAllergens: prioritizationResult.prioritizedAllergens,
      extractedText: extractedTextResult,
    };
  } catch (error) {
    console.error("Error in analyzeIngredientsListImage server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    throw new Error(`Failed to analyze ingredients list image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
