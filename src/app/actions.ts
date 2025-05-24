
"use server";

import OpenAI from 'openai';
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensInput, PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types";

// Define the expected structure from OpenAI
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
  // Explicitly check for API key configuration before making any calls
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const knownAllergiesString = userKnownAllergiesArray.join(', ');
    let identifiedAllergens: AllergenInfo[] = [];

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using a vision-capable model
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
           // Ensure confidence is a number and formatted
           confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0 
         }));
      }
    } else {
      console.warn("OpenAI response content was null or empty.");
    }
    
    // Step 2: Prioritize allergens based on user profile
    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergen),
      userAllergies: userKnownAllergiesArray,
    };
    const prioritizationResult: PrioritizeAllergensOutput = prioritizeAllergens(prioritizationInput);

    return {
      identifiedAllergens: identifiedAllergens,
      prioritizedAllergens: prioritizationResult.prioritizedAllergens,
      // foodDescription can be added if OpenAI provides it
    };
  } catch (error) {
    console.error("Error in analyzeFoodImage server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    // Re-throw the error to be caught by the calling component
    throw new Error(`Failed to analyze food image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
