
export default {
  // General
  appName: 'AllergyEye',
  close: 'Close',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  add: 'Add',
  view: 'View',
  clearAll: 'Clear All',

  // Navigation
  nav: {
    scanFood: 'Scan Food',
    scanHistory: 'Scan History',
    allergyProfile: 'Allergy Profile',
    settings: 'Settings',
  },

  // HomePage & ImageUploader
  home: {
    scanFoodTab: 'Scan Food Item',
    scanIngredientsTab: 'Scan Ingredients List',
    uploadTitle: 'Upload Food Image',
    uploadDescription: 'Take a picture or select an image of a food item to identify potential allergens.',
    uploadIngredientsTitle: 'Upload Ingredients List Image',
    uploadIngredientsDescription: 'Upload a clear image of a product\'s ingredients list. We\'ll read the text and find potential allergens.',
    howItWorksTitle: 'How Food Scanning Works',
    howItWorksStep1: '1. Upload an image or take a photo of a food item.',
    howItWorksStep2: '2. Our AI will analyze the image to identify potential allergens and their sources in the food.',
    howItWorksStep3: '3. Results will show allergens, their sources, and confidence levels.',
    howItWorksStep4: "Personalize results by adding your known allergies in the 'Profile' section.",
    howItWorksIngredientsTitle: 'How Ingredient Scanning Works',
    howItWorksIngredientsStep1: "1. Upload a clear image of a product's ingredients list.",
    howItWorksIngredientsStep2: "2. Our AI will read the text and identify potential allergens mentioned.",
    howItWorksIngredientsStep3: "3. Results will show identified allergens and the text snippet they came from.",
    howItWorksIngredientsStep4: "Personalize by adding your known allergies in 'Profile'.",
    analysisCompleteTitle: 'Analysis Complete',
    analysisCompleteDescription: 'Potential allergens and their sources identified from the image.',
    analysisFailedTitle: 'Analysis Failed',
    analysisFailedDescription: 'Could not analyze the image. Please try again.',
    analyzing: 'Analyzing Image...',
    clickOrDrag: 'Click or drag & drop to upload',
    fileTypes: 'PNG, JPG, WEBP up to 5MB',
    selectedFile: 'Selected: {fileName}',
    fileTooLarge: 'File too large',
    fileTooLargeDesc: 'Please upload an image smaller than 5MB.',
    invalidFileType: 'Invalid file type',
    invalidFileTypeDesc: 'Please upload an image file (e.g., JPG, PNG, WEBP).',
    removeImage: 'Remove image',

    // Mode Switch and Camera Mode
    currentMode: "Current Mode: {mode}",
    uploadModeLabel: "Upload Image",
    cameraModeLabel: "Use Camera",
    captureButton: "Capture Photo",
    cameraPermissionDeniedTitle: "Camera Access Denied",
    cameraPermissionDeniedDesc: "Please enable camera permissions in your browser settings to use this feature.",
    cameraAccessRequired: "Camera Access Required",
    cameraAccessRequiredDesc: "Please allow camera access to use this feature.",
    cameraInitializing: "Initializing Camera...",
    noCameraDetected: "No camera detected or permission denied.",
    imagePreview: "Image Preview",
    useThisPhotoButton: "Use This Photo",
    retakePhotoButton: "Retake Photo",
    allergensFoundCount: '{count} allergens found',
    includesYourAllergy: '(Includes your allergy!)',
    switchToUploadMode: 'Switch to Upload Mode',
    switchToCameraMode: 'Switch to Camera Mode',
  },

  // AllergenResults Component
  allergenResults: {
    title: 'Allergen Analysis',
    description: 'Potential allergens identified. Allergens matching your profile are highlighted.',
    noAllergensDetected: 'No Allergens Detected',
    noAllergensInfo: 'Our analysis did not find any common allergens. However, always double-check if you have severe allergies.',
    yourAllergyBadge: 'YOUR ALLERGY',
    confidence: 'Confidence: {percentage}%',
    lowConfidenceInfo: 'Low confidence. May not be present.',
    sourceLabel: 'Source: {source}',
    unknownSource: 'Source: Not specified',
    extractedTextTitle: 'Extracted Ingredients Text:',
  },

  // ProfilePage & ProfileForm
  profile: {
    title: 'Your Allergy Profile',
    description: 'List your known allergies. This will help prioritize them in scan results.',
    addAllergyLabel: 'Add an allergy (e.g., peanuts, gluten, dairy)',
    addAllergyPlaceholder: 'Enter an allergy',
    currentAllergies: 'Your current allergies:',
    noAllergiesYet: "You haven't added any allergies yet.",
    saveProfileButton: 'Save Profile',
    profileSavedTitle: 'Profile Saved',
    profileSavedDescription: 'Your allergy profile has been updated.',
    allergyAlreadyAdded: 'Allergy already added',
    allergyAlreadyAddedDesc: '"{allergy}" is already in your list.',
    whyAddAllergiesTitle: 'Why Add Allergies?',
    whyAddAllergiesInfo: "Adding your known allergies helps AllergyEye personalize your experience:",
    whyAddAllergiesBenefit1: "Prioritized Warnings: Allergens you're sensitive to will be highlighted more prominently in scan results.",
    whyAddAllergiesBenefit2: "Tailored Insights: Future features may use this information to provide more specific advice.",
    privacyInfo: "Your privacy is important. This information is stored locally on your device and is not shared."
  },

  // HistoryPage & ScanHistoryList Component
  history: {
    title: 'Scan History',
    description: 'Review your past food allergen scans.',
    noHistory: 'You have no past scans. Start by analyzing a food image!',
    scanDetailsTitle: 'Scan Details',
    scanDetailsDescription: 'Details for scan from {timestamp}.',
    scannedOn: 'Scanned on: {date} at {time}',
    identifiedAllergens: 'Identified Allergens:',
    noAllergensInScan: 'No allergens detected in this scan.',
    moreItems: '+{count} more',
    confirmClearAllTitle: 'Are you sure?',
    confirmClearAllDescription: 'This will permanently delete all your scan history. This action cannot be undone.',
    clearHistoryButton: 'Clear History',
    confirmDeleteItemTitle: 'Delete Scan?',
    confirmDeleteItemDescription: 'Are you sure you want to delete this scan from your history? This action cannot be undone.',
    allergensFoundCount: '{count} allergens found',
    includesYourAllergy: '(Includes your allergy!)',
    scannedFoodAlt: 'Scanned food item',
  },

  // Settings Page
  settings: {
    title: 'Developer Settings',
    description: 'Manually override app behavior for testing purposes. Settings are saved locally to your browser.',
    operatingModeTitle: 'Operating Mode Override (Food Scan)',
    modeAutomatic: 'Automatic (Mobile: Camera, Desktop: Upload)',
    modeForceCamera: 'Force Camera Mode (for testing on desktop)',
    modeForceUpload: 'Force Upload Mode',
    settingsSaved: 'Settings Saved!',
    settingsSavedDesc: 'Your preferred operating mode has been updated.',
  },

  // AI Interaction Prompts
  aiPrompt: {
    systemInstruction: "You are an AI that identifies potential allergens in food items from images. Analyze the image. Your response must be in {locale}.",
    jsonStructure: "Respond with a JSON object containing a single key 'allergens'. The 'allergens' key should have an array of objects. Each object in this array must have three keys: 'allergen' (a string representing the name of the identified allergen in {locale}, e.g., 'Peanuts', 'Gluten', 'Dairy'), 'confidence' (a number between 0.0 and 1.0 inclusive, representing your confidence that this allergen is present), and 'sourceFoodItem' (an optional string in {locale}, describing the specific food item in the image that is the source of this allergen, e.g., 'the cookie', 'the salad dressing'). If you do not identify any allergens, the 'allergens' array should be empty.",
    userAllergyContext: "Focus only on ingredients visible or strongly implied by the image. For each identified allergen, also specify its likely source food item from the image in the 'sourceFoodItem' field, described in {locale}. Be comprehensive in your analysis. List all *potential* allergens you can infer from the image, even if their presence is only suspected or less certain. Your goal is to be as exhaustive as possible in identifying potential risks. For context, the user has these known allergies (input in their current language): {knownAllergiesString}. However, your primary task is to identify all potential allergens and their sources from the image itself, listing allergen names and source descriptions in {locale}.",
    identifyRequest: "Identify allergens in this food image. Please list allergen names in {locale}.",

    ingredientsSystemInstruction: "You are an AI that extracts text from an image of an ingredients list and then identifies potential allergens from that extracted text. Your response must be in {locale}.",
    ingredientsJsonStructure: "Respond with a JSON object. This object must contain two keys: 'extractedText' (a string containing all the text you could read from the ingredients list image) and 'allergens' (an array of objects). Each object in the 'allergens' array must have three keys: 'allergen' (a string representing the name of the identified allergen in {locale}, e.g., 'Peanuts', 'Gluten', 'Milk Powder'), 'confidence' (a number between 0.0 and 1.0 inclusive, representing your confidence that this allergen is present based on the text), and 'sourceFoodItem' (a string in {locale}, representing the exact phrase or ingredient from the extracted text that indicates this allergen, e.g., 'Soy Lecithin', 'Wheat Flour'). If no allergens are identified, the 'allergens' array should be empty. If no text can be extracted, 'extractedText' should be an empty string and 'allergens' an empty array.",
    ingredientsUserAllergyContext: "First, accurately transcribe all text from the provided image of an ingredients list into the 'extractedText' field. Then, from this 'extractedText', identify all potential allergens. For each identified allergen, provide its name in {locale} in the 'allergen' field, your confidence in the 'confidence' field, and the exact text snippet from the ingredients list that indicates this allergen in the 'sourceFoodItem' field (also in {locale}). List all *potential* allergens you can infer from the text, even if their presence is only suspected or less certain. Your goal is to be as exhaustive as possible. For context, the user has these known allergies (input in their current language): {knownAllergiesString}. Your primary task is to analyze the provided ingredients list image.",
    ingredientsIdentifyRequest: "Please extract text from this ingredients list image and identify all potential allergens from the text. List allergen names and their source text snippets in {locale}.",
  },

  // Global Metadata
  metadata: {
    title: 'AllergyEye - Food Allergen Scanner',
    description: 'Identify food allergens by taking a picture or scanning an ingredients list. Supports English, Simplified Chinese, and Traditional Chinese.',
  },

  // Language Switcher
  languageSwitcher: {
    placeholder: 'Language',
    en: 'English',
    zhCN: '简体中文',
    zhTW: '繁體中文',
  },
};
