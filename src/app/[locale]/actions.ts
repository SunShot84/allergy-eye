"use server";

import OpenAI from 'openai';
import { prioritizeAllergens } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { PrioritizeAllergensInput, PrioritizeAllergensOutput } from "@/ai/flows/prioritize-allergens-based-on-profile";
import type { AllergenInfo } from "@/lib/types"; // Now uses the updated interface with allergenId
import { getI18n } from '@/lib/i18n/server';
import { 
  findAllergenIdsByKeyword, 
  getAllergenById, 
  getAllergensByIds,
  type AllergenName, // Import AllergenName type
  type Allergen as StandardAllergen // Renamed to avoid conflict if AllergenInfo uses 'Allergen'
} from '@/lib/allergens';

// Helper function to get display name on the server
const getAllergenDisplayNameForAction = (allergen: StandardAllergen, locale: string): string => {
  const langKey = locale.toLowerCase();
  if (langKey === 'zh-cn' && allergen.name.sc?.length > 0) return allergen.name.sc[0];
  if (langKey === 'zh-tw' && allergen.name.tc?.length > 0) return allergen.name.tc[0];
  if (allergen.name.eng?.length > 0) return allergen.name.eng[0];
  return allergen.id;
};

// Helper function to convert allergen names to IDs
const convertAllergenNamesToIds = (allergenNames: string[], currentLocale: string): AllergenInfo[] => {
  const results: AllergenInfo[] = [];
  
  for (const name of allergenNames) {
    // First try to match in the current locale for better accuracy
    let foundIds = findAllergenIdsByKeyword(name, currentLocale as keyof AllergenName);
    
    // If no matches in current locale, try all languages
    if (foundIds.length === 0) {
      foundIds = findAllergenIdsByKeyword(name);
    }
    
    // Add each found ID as an AllergenInfo entry
    // If multiple IDs match the same name, we add them all with equal confidence
    for (const id of foundIds) {
      if (id && !results.some(r => r.allergenId === id)) {
        results.push({
          allergenId: id,
          confidence: 0.8, // Default confidence for matched allergens
          sourceFoodItem: name, // Store original AI-detected name as source
        });
      }
    }
  }
  
  return results;
};

// Helper function to convert user allergen IDs to display names for AI context
const convertUserAllergenIdsToDisplayNames = (allergenIds: string[], currentLocale: string): string => {
  if (!allergenIds || allergenIds.length === 0) return '';
  
  const allergenNames = allergenIds
    .map(id => {
      const allergen = getAllergenById(id);
      return allergen ? getAllergenDisplayNameForAction(allergen, currentLocale) : id;
    })
    .filter(name => name);
  
  return allergenNames.join(', ');
};

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
  identifiedAllergens: AllergenInfo[]; // Now contains allergenId instead of allergen name
  prioritizedAllergens: string[]; // Array of allergen IDs
  foodDescription?: string; // For food scans
  extractedText?: string; // For ingredients list scans
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze Food Image - Updated to use ID-based matching
export async function analyzeFoodImage(
  photoDataUri: string,
  userKnownAllergiesArray: string[], // Now expects array of allergen IDs
  currentLocale: 'en' | 'zh-CN' | 'zh-TW',
  ipLocation?: { // 添加可选的位置信息参数
    country: string;
    region?: string;
    city?: string;
  }
): Promise<AllergenAnalysisResult> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const t = await getI18n();

  try {
    // Convert user's allergen IDs to display names for AI context
    const knownAllergiesString = convertUserAllergenIdsToDisplayNames(userKnownAllergiesArray, currentLocale) || t('profile.noAllergiesYet');
    let identifiedAllergens: AllergenInfo[] = [];

    const systemPromptInstruction = t('aiPrompt.systemInstruction');
    const jsonStructureInstruction = t('aiPrompt.jsonStructure');
    const userAllergyContextInstruction = t('aiPrompt.userAllergyContext');

    // 构建位置信息提示
    let locationContext = '';
    if (ipLocation) {
      const locationParts = [];
      if (ipLocation.city) locationParts.push(ipLocation.city);
      if (ipLocation.region) locationParts.push(ipLocation.region);
      if (ipLocation.country) locationParts.push(ipLocation.country);
      if (locationParts.length > 0) {
        const location = locationParts.join(', ');
        locationContext = t('aiPrompt.locationContext').replace('{location}', location);
      }
    }

    const systemPrompt = `${systemPromptInstruction} ${jsonStructureInstruction} ${userAllergyContextInstruction} ${locationContext}`;
    const userPromptText = t('aiPrompt.identifyRequest');

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
        // Extract allergen names from OpenAI response
        const allergenNamesWithConfidence = openAIResult.allergens.map(a => ({
          name: a.allergen,
          confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0,
          sourceFoodItem: a.sourceFoodItem || undefined,
        }));
        
        // Convert allergen names to IDs using our matching mechanism
        for (const item of allergenNamesWithConfidence) {
          // Find matching allergen IDs for this name
          let foundIds = findAllergenIdsByKeyword(item.name, currentLocale as keyof AllergenName);
          if (foundIds.length === 0) {
            foundIds = findAllergenIdsByKeyword(item.name);
          }
          
          // Add each matched ID as an AllergenInfo entry
          for (const id of foundIds) {
            if (id && !identifiedAllergens.some(existing => existing.allergenId === id)) {
              identifiedAllergens.push({
                allergenId: id,
                confidence: item.confidence,
                sourceFoodItem: item.sourceFoodItem || item.name,
              });
            }
          }
        }
      }
    } else {
      console.warn("OpenAI response content was null or empty for food image analysis.");
    }

    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergenId), // Now using allergenId
      userAllergies: userKnownAllergiesArray, // Already an array of IDs
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


// Analyze Ingredients List Image - Updated to use ID-based matching
export async function analyzeIngredientsListImage(
  photoDataUri: string,
  userKnownAllergiesArray: string[], // Now expects array of allergen IDs
  currentLocale: 'en' | 'zh-CN' | 'zh-TW',
  ipLocation?: { // 添加可选的位置信息参数
    country: string;
    region?: string;
    city?: string;
  }
): Promise<AllergenAnalysisResult> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const t = await getI18n();

  try {
    // Convert user's allergen IDs to display names for AI context
    const knownAllergiesString = convertUserAllergenIdsToDisplayNames(userKnownAllergiesArray, currentLocale) || t('profile.noAllergiesYet');
    let identifiedAllergens: AllergenInfo[] = [];
    let extractedTextResult: string = "";

    const systemPromptInstruction = t('aiPrompt.ingredientsSystemInstruction');
    const jsonStructureInstruction = t('aiPrompt.ingredientsJsonStructure');
    const userAllergyContextInstruction = t('aiPrompt.ingredientsUserAllergyContext');

    // 构建位置信息提示
    let locationContext = '';
    if (ipLocation) {
      const locationParts = [];
      if (ipLocation.city) locationParts.push(ipLocation.city);
      if (ipLocation.region) locationParts.push(ipLocation.region);
      if (ipLocation.country) locationParts.push(ipLocation.country);
      if (locationParts.length > 0) {
        const location = locationParts.join(', ');
        locationContext = t('aiPrompt.locationContext').replace('{location}', location);
      }
    }

    const systemPrompt = `${systemPromptInstruction} ${jsonStructureInstruction} ${userAllergyContextInstruction} ${locationContext}`;
    const userPromptText = t('aiPrompt.ingredientsIdentifyRequest');

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
        // Extract allergen names from OpenAI response
        const allergenNamesWithConfidence = openAIResult.allergens.map(a => ({
          name: a.allergen,
          confidence: typeof a.confidence === 'number' ? parseFloat(a.confidence.toFixed(2)) : 0,
          sourceFoodItem: a.sourceFoodItem || undefined,
        }));
        
        // Convert allergen names to IDs using our matching mechanism
        for (const item of allergenNamesWithConfidence) {
          // Find matching allergen IDs for this name
          let foundIds = findAllergenIdsByKeyword(item.name, currentLocale as keyof AllergenName);
          if (foundIds.length === 0) {
            foundIds = findAllergenIdsByKeyword(item.name);
          }
          
          // Add each matched ID as an AllergenInfo entry
          for (const id of foundIds) {
            if (id && !identifiedAllergens.some(existing => existing.allergenId === id)) {
              identifiedAllergens.push({
                allergenId: id,
                confidence: item.confidence,
                sourceFoodItem: item.sourceFoodItem || item.name,
              });
            }
          }
        }
      }
    } else {
      console.warn("OpenAI response content was null or empty for ingredients list analysis.");
    }

    const prioritizationInput: PrioritizeAllergensInput = {
      identifiedAllergens: identifiedAllergens.map(a => a.allergenId), // Now using allergenId
      userAllergies: userKnownAllergiesArray, // Already an array of IDs
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

// New function to process allergen tags with o4-mini
export async function processAllergenTags(
  tagsInput: string,
  currentLocale: 'en' | 'zh-CN' | 'zh-TW'
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const t = await getI18n();

  try {
    const systemInstruction = t('aiPrompt.tagProcessingSystemInstruction');
    const userMessage = t('aiPrompt.tagProcessingUserMessage');

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Changed model to gpt-4.1-nano-2025-04-14
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 300, // Adjusted max_tokens for tag processing
    });

    if (response.choices[0].message.content) {
      const openAIResult = JSON.parse(response.choices[0].message.content) as { processedTags?: string[] };
      if (openAIResult.processedTags && Array.isArray(openAIResult.processedTags)) {
        return openAIResult.processedTags.map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    // If no tags or error, return empty array
    return [];
  } catch (error) {
    console.error("Error in processAllergenTags server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    // It might be better to return empty array or throw a custom error that the UI can handle
    // For now, returning empty array to avoid breaking the flow if AI fails
    return [];
  }
}

// New function to analyze allergy report image
export async function analyzeAllergyReportImage(
  photoDataUri: string,
  currentLocale: 'en' | 'zh-CN' | 'zh-TW'
): Promise<string[]> { // Returns an array of allergen strings
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    const errorMessage = "OpenAI API key is not configured or is still the placeholder. Please update your .env file with your actual OpenAI API key.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const t = await getI18n();

  try {
    const systemInstruction = t('aiPrompt.reportAnalysisSystemInstruction');
    const userMessage = t('aiPrompt.reportAnalysisUserMessage');

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14", // Using a capable vision model, ensure this is suitable or use the latest vision model
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: photoDataUri,
                detail: "high" // Use high detail for OCR tasks on reports
              },
            },
          ],
        },
      ],
      max_tokens: 1000, // Reports might have a fair amount of text
    });

    if (response.choices[0].message.content) {
      const openAIResult = JSON.parse(response.choices[0].message.content) as { identifiedAllergensFromReport?: string[] };
      if (openAIResult.identifiedAllergensFromReport && Array.isArray(openAIResult.identifiedAllergensFromReport)) {
        return openAIResult.identifiedAllergensFromReport.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
      }
    }
    return []; // Return empty array if no allergens found or in case of parsing issues
  } catch (error) {
    console.error("Error in analyzeAllergyReportImage server action:", error);
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", error.status, error.message, error.code, error.type);
    }
    // Consider how to propagate this error to the UI if needed, for now, returns empty on error
    return [];
  }
}
