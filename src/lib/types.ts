export interface AllergenInfo {
  allergen: string;
  confidence: number; // 0-1
}

export interface ScanResultItem {
  id: string;
  imageDataUrl: string; // base64 encoded image
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[]; // Names of allergens that match user profile
  userProfileAllergiesAtScanTime: string[];
  timestamp: number;
  foodDescription?: string; // Optional: A brief description of the food if available from AI
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
