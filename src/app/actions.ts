
"use server";

import OpenAI from 'openai';
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensInput, PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types";

// Define the expected structure from OpenAI, similar to the old IdentifyAllergensFromImageOutput
interface OpenAIAllergenIdentificationOutput {
  allergens: AllergenInfo[];
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
  userKnownAllergiesArray: string[]
): Promise<AllergenAnalysisResult> {
  try {
    const knownAllergiesString = userKnownAllergiesArray.join(', ');

    // Step 1: Identify allergens from image using OpenAI
    let identifiedAllergens: AllergenInfo[] = [];
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set. Skipping AI analysis.");
      // Potentially return a default or error state, or mock data for UI development
      // For now, we'll proceed with an empty list of allergens if the key is missing
      // and let prioritization handle it.
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo", 
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an AI that identifies potential allergens in food items from images. Analyze the image.
Respond with a JSON object containing a single key 'allergens'. The 'allergens' key should have an array of objects. Each object in this array must have two keys:
1. 'allergen': A string representing the name of the identified allergen (e.g., 'Peanuts', 'Gluten', 'Dairy').
2. 'confidence': A number between 0.0 and 1.0 (inclusive) representing your confidence that this allergen is present in the image.
If you do not identify any allergens in the image, the 'allergens' array should be empty.
Focus only on ingredients visible or strongly implied by the image.
For context, the user has these known allergies: ${knownAllergiesString}. However, your primary task is to identify all potential allergens from the image itself.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify allergens in this food image." },
              {
                type: "image_url",
                image_url: {
                  url: photoDataUri, // Expected format: "data:image/jpeg;base64,..."
                },
              },
            ],
          },
        ],
        max_tokens: 1000, 
      });

      if (response.choices[0].message.content) {
        const openAIResult = JSON.parse(response.choices[0].message.content) as OpenAIAllergenIdentificationOutput;
        if (openAIResult.allergens && Array.isArray(openAIResult.allergens)) {
           identifiedAllergens = openAIResult.allergens.map(a => ({
             allergen: a.allergen,
             confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0 
           }));
        }
      } else {
        console.warn("OpenAI response content was null or empty.");
      }
    }
    
    // Step 2: Prioritize allergens based on user profile
    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    };
    const prioritizationResult: PrioritizeAllergensOutput = prioritizeAllergens(prioritizationInput); // Now a synchronous call

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
