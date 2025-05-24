
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
    settings: 'Settings', // New
  },

  // HomePage & ImageUploader
  home: {
    uploadTitle: 'Upload Food Image',
    uploadDescription: 'Take a picture or select an image of a food item to identify potential allergens.',
    howItWorksTitle: 'How it Works',
    howItWorksStep1: '1. Upload an image or take a photo of a food item.',
    howItWorksStep2: '2. Our AI will analyze the image to identify potential allergens.',
    howItWorksStep3: '3. Results will show allergens and confidence levels.',
    howItWorksStep4: "Personalize results by adding your known allergies in the 'Profile' section.",
    analysisCompleteTitle: 'Analysis Complete',
    analysisCompleteDescription: 'Potential allergens identified.',
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
    description: 'Potential allergens identified in the image. Allergens matching your profile are highlighted.',
    noAllergensDetected: 'No Allergens Detected',
    noAllergensInfo: 'Our analysis did not find any common allergens in the uploaded image. However, always double-check ingredients if you have severe allergies.',
    yourAllergyBadge: 'YOUR ALLERGY',
    confidence: 'Confidence: {percentage}%',
    lowConfidenceInfo: 'Low confidence. May not be present.',
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

  // Settings Page -- NEW
  settings: {
    title: 'Developer Settings',
    description: 'Manually override app behavior for testing purposes. Settings are saved locally to your browser.',
    operatingModeTitle: 'Operating Mode Override',
    modeAutomatic: 'Automatic (Mobile: Camera, Desktop: Upload)',
    modeForceCamera: 'Force Camera Mode (for testing on desktop)',
    modeForceUpload: 'Force Upload Mode',
    settingsSaved: 'Settings Saved!',
    settingsSavedDesc: 'Your preferred operating mode has been updated.',
  },

  // Global Metadata
  metadata: {
    title: 'AllergyEye - Food Allergen Scanner',
    description: 'Identify food allergens by taking a picture. Supports English, Simplified Chinese, and Traditional Chinese.',
  },

  // Language Switcher
  languageSwitcher: {
    placeholder: 'Language',
    en: 'English',
    zhCN: '简体中文',
    zhTW: '繁體中文',
  },
};
