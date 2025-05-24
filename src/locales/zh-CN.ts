export default {
  // General
  appName: '过敏眼',
  close: '关闭',
  delete: '删除',
  cancel: '取消',
  save: '保存',
  add: '添加',
  view: '查看',
  clearAll: '全部清除',

  // Navigation
  nav: {
    scanFood: '扫描食物',
    scanHistory: '扫描历史',
    allergyProfile: '过敏档案',
  },

  // HomePage & ImageUploader
  home: {
    uploadTitle: '上传食物图片',
    uploadDescription: '拍摄或选择食物图片以识别潜在的过敏原。',
    howItWorksTitle: '工作原理',
    howItWorksStep1: '1. 上传食物图片。',
    howItWorksStep2: '2. 我们的人工智能将分析图片以识别潜在的过敏原。',
    howItWorksStep3: '3. 结果将显示过敏原和置信度。',
    howItWorksStep4: '在“档案”部分添加您已知的过敏原，以个性化结果。',
    analysisCompleteTitle: '分析完成',
    analysisCompleteDescription: '已识别潜在的过敏原。',
    analysisFailedTitle: '分析失败',
    analysisFailedDescription: '无法分析图片。请重试。',
    analyzing: '正在分析图片...',
    clickOrDrag: '点击或拖拽上传',
    fileTypes: '支持PNG, JPG, WEBP格式，最大5MB',
    selectedFile: '已选择: {fileName}',
    fileTooLarge: '文件过大',
    fileTooLargeDesc: '请上传小于5MB的图片。',
    invalidFileType: '文件类型无效',
    invalidFileTypeDesc: '请上传图片文件 (例如 JPG, PNG, WEBP)。',
    removeImage: '移除图片',
  },

  // AllergenResults Component
  allergenResults: {
    title: '过敏原分析',
    description: '图片中识别出的潜在过敏原。与您档案匹配的过敏原将被高亮显示。',
    noAllergensDetected: '未检测到过敏原',
    noAllergensInfo: '我们的分析未在上传的图片中发现任何常见的过敏原。但是，如果您有严重的过敏症，请务必仔细检查成分。',
    yourAllergyBadge: '您的过敏原',
    confidence: '置信度: {percentage}%',
    lowConfidenceInfo: '置信度较低。可能不存在。',
  },

  // ProfilePage & ProfileForm
  profile: {
    title: '您的过敏档案',
    description: '列出您已知的过敏原。这将有助于在扫描结果中优先显示它们。',
    addAllergyLabel: '添加过敏原 (例如：花生、麸质、奶制品)',
    addAllergyPlaceholder: '输入过敏原',
    currentAllergies: '您当前的过敏原:',
    noAllergiesYet: '您尚未添加任何过敏原。',
    saveProfileButton: '保存档案',
    profileSavedTitle: '档案已保存',
    profileSavedDescription: '您的过敏档案已更新。',
    allergyAlreadyAdded: '过敏原已添加',
    allergyAlreadyAddedDesc: '"{allergy}" 已在您的列表中。',
    whyAddAllergiesTitle: '为何添加过敏原？',
    whyAddAllergiesInfo: "添加您已知的过敏原有助于 过敏眼 为您提供个性化体验：",
    whyAddAllergiesBenefit1: "优先警告：您敏感的过敏原将在扫描结果中更突出地显示。",
    whyAddAllergiesBenefit2: "定制化建议：未来功能可能会使用此信息提供更具体的建议。",
    privacyInfo: "您的隐私至关重要。此信息存储在您的设备本地，不会被共享。"
  },

  // HistoryPage & ScanHistoryList Component
  history: {
    title: '扫描历史',
    description: '查看您过去的食物过敏原扫描记录。',
    noHistory: '您没有过去的扫描记录。从分析食物图片开始吧！',
    scanDetailsTitle: '扫描详情',
    scanDetailsDescription: '来自 {timestamp} 的扫描详情。',
    scannedOn: '扫描于: {date} {time}',
    identifiedAllergens: '已识别过敏原:',
    noAllergensInScan: '本次扫描未检测到过敏原。',
    moreItems: '还有{count}项',
    confirmClearAllTitle: '确定吗？',
    confirmClearAllDescription: '这将永久删除您所有的扫描历史记录。此操作无法撤销。',
    clearHistoryButton: '清除历史',
    confirmDeleteItemTitle: '删除扫描记录？',
    confirmDeleteItemDescription: '您确定要从历史记录中删除此扫描记录吗？此操作无法撤销。',
  },

  // Global Metadata
  metadata: {
    title: '过敏眼 - 食物过敏原扫描器',
    description: '通过拍照识别食物过敏原。支持英语、简体中文和繁体中文。',
  },

  // Language Switcher
  languageSwitcher: {
    placeholder: '语言',
    en: 'English',
    zhCN: '简体中文',
    zhTW: '繁體中文',
  },
};
