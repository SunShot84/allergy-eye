
export interface AllergenInfo {
  allergen: string;
  confidence: number; // 0-1
  sourceFoodItem?: string; // Optional: Describes the food item (visual or textual snippet) that is the source
}

export interface ScanResultItem {
  id: string;
  imageDataUrl: string; // base64 encoded image
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[]; // Names of allergens that match user profile
  userProfileAllergiesAtScanTime: string[];
  timestamp: number;
  foodDescription?: string; // Optional: A brief description of the food if available from AI (food scan)
  extractedText?: string; // Optional: Extracted text from ingredients list scan
  scanType: 'food' | 'ingredients'; // To distinguish scan mode
}

export interface UserProfile {
  knownAllergies: string[];
}

export interface IdentifiedAllergensOutput {
  allergens: AllergenInfo[];
}

export interface PrioritizedAllergensOutput {
  prioritizedAllergens: string[];
}
