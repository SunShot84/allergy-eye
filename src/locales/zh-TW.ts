export default {
  // General
  appName: '過敏眼',
  close: '關閉',
  delete: '刪除',
  cancel: '取消',
  save: '儲存',
  add: '新增',
  view: '檢視',
  clearAll: '全部清除',

  // Navigation
  nav: {
    scanFood: '掃描食物',
    scanHistory: '掃描歷史',
    allergyProfile: '過敏檔案',
  },

  // HomePage & ImageUploader
  home: {
    uploadTitle: '上傳食物圖片',
    uploadDescription: '拍攝或選擇食物圖片以識別潛在的過敏原。',
    howItWorksTitle: '運作方式',
    howItWorksStep1: '1. 上傳食物圖片。',
    howItWorksStep2: '2. 我們的人工智慧將分析圖片以識別潛在的過敏原。',
    howItWorksStep3: '3. 結果將顯示過敏原和可信度。',
    howItWorksStep4: '在「檔案」部分新增您已知的過敏原，以個性化結果。',
    analysisCompleteTitle: '分析完成',
    analysisCompleteDescription: '已識別潛在的過敏原。',
    analysisFailedTitle: '分析失敗',
    analysisFailedDescription: '無法分析圖片。請重試。',
    analyzing: '正在分析圖片...',
    clickOrDrag: '點擊或拖曳上傳',
    fileTypes: '支援PNG, JPG, WEBP格式，最大5MB',
    selectedFile: '已選擇: {fileName}',
    fileTooLarge: '檔案過大',
    fileTooLargeDesc: '請上傳小於5MB的圖片。',
    invalidFileType: '檔案類型無效',
    invalidFileTypeDesc: '請上傳圖片檔案 (例如 JPG, PNG, WEBP)。',
    removeImage: '移除圖片',
  },

  // AllergenResults Component
  allergenResults: {
    title: '過敏原分析',
    description: '圖片中識別出的潛在過敏原。與您檔案匹配的過敏原將被高亮顯示。',
    noAllergensDetected: '未檢測到過敏原',
    noAllergensInfo: '我們的分析未在您上傳的圖片中發現任何常見的過敏原。但是，如果您有嚴重的過敏症，請務必仔細檢查成分。',
    yourAllergyBadge: '您的過敏原',
    confidence: '可信度: {percentage}%',
    lowConfidenceInfo: '可信度較低。可能不存在。',
  },

  // ProfilePage & ProfileForm
  profile: {
    title: '您的過敏檔案',
    description: '列出您已知的過敏原。這將有助於在掃描結果中優先顯示它們。',
    addAllergyLabel: '新增過敏原 (例如：花生、麩質、乳製品)',
    addAllergyPlaceholder: '輸入過敏原',
    currentAllergies: '您目前的過敏原:',
    noAllergiesYet: '您尚未新增任何過敏原。',
    saveProfileButton: '儲存檔案',
    profileSavedTitle: '檔案已儲存',
    profileSavedDescription: '您的過敏檔案已更新。',
    allergyAlreadyAdded: '過敏原已新增',
    allergyAlreadyAddedDesc: '"{allergy}" 已在您的清單中。',
    whyAddAllergiesTitle: '為何新增過敏原？',
    whyAddAllergiesInfo: "新增您已知的過敏原，有助於 過敏眼 為您提供個人化體驗：",
    whyAddAllergiesBenefit1: "優先警告：您敏感的過敏原將在掃描結果中更突顯。",
    whyAddAllergiesBenefit2: "客製化建議：未來功能可能會使用此資訊提供更具體的建議。",
    privacyInfo: "您的隱私至關重要。此資訊儲存在您的裝置本地，不會被共享。"
  },

  // HistoryPage & ScanHistoryList Component
  history: {
    title: '掃描歷史',
    description: '檢閱您過去的食物過敏原掃描記錄。',
    noHistory: '您沒有過去的掃描記錄。從分析食物圖片開始吧！',
    scanDetailsTitle: '掃描詳情',
    scanDetailsDescription: '來自 {timestamp} 的掃描詳情。',
    scannedOn: '掃描於: {date} {time}',
    identifiedAllergens: '已識別過敏原:',
    noAllergensInScan: '本次掃描未檢測到過敏原。',
    moreItems: '還有{count}項',
    confirmClearAllTitle: '確定嗎？',
    confirmClearAllDescription: '這將永久刪除您所有的掃描歷史記錄。此操作無法撤銷。',
    clearHistoryButton: '清除歷史',
    confirmDeleteItemTitle: '刪除掃描記錄？',
    confirmDeleteItemDescription: '您確定要從歷史記錄中刪除此掃描記錄嗎？此操作無法撤銷。',
  },
  
  // Global Metadata
  metadata: {
    title: '過敏眼 - 食物過敏原掃描器',
    description: '透過拍照識別食物過敏原。支援英文、簡體中文和繁體中文。',
  },

  // Language Switcher
  languageSwitcher: {
    placeholder: '語言',
    en: 'English',
    zhCN: '简体中文',
    zhTW: '繁體中文',
  },
} as const;
