export interface AllergenInfo {
  allergenId: string; // Changed from 'allergen' to 'allergenId' to store standardized allergen ID from allergens_list.json
  confidence: number; // 0-1
  sourceFoodItem?: string; // Optional: Describes the food item (visual or textual snippet) that is the source
}

export interface ScanResultItem {
  id: string;
  imageDataUrl: string; // base64 encoded image
  identifiedAllergens: AllergenInfo[];
  prioritizedAllergens: string[]; // IDs of allergens that match user profile (now stores IDs instead of names)
  userProfileAllergiesAtScanTime: string[]; // User's known allergen IDs at scan time
  timestamp: number;
  foodDescription?: string; // Optional: A brief description of the food if available from AI (food scan)
  extractedText?: string; // Optional: Extracted text from ingredients list scan
  scanType: 'food' | 'ingredients'; // To distinguish scan mode
}

export interface UserProfile {
  knownAllergies: string[]; // Array of allergen IDs from allergens_list.json
}

export interface IdentifiedAllergensOutput {
  allergens: AllergenInfo[];
}

export interface PrioritizedAllergensOutput {
  prioritizedAllergens: string[]; // Array of allergen IDs
}
