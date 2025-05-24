
export default {
  // General
  appName: '过敏眼 AllergyEye',
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
    settings: '设置',
  },

  // HomePage & ImageUploader
  home: {
    scanFoodTab: '扫描食物成品',
    scanIngredientsTab: '扫描配料表',
    uploadTitle: '上传食物图片',
    uploadDescription: '拍摄或选择食物图片以识别潜在的过敏原。',
    uploadIngredientsTitle: '上传配料表图片',
    uploadIngredientsDescription: '上传清晰的配料表图片，我们将读取文本并找出潜在过敏原。',
    howItWorksTitle: '食物扫描如何工作',
    howItWorksStep1: '1. 上传食物图片或拍照。',
    howItWorksStep2: '2. 我们的人工智能将分析图片以识别潜在的过敏原及其在食物中的来源。',
    howItWorksStep3: '3. 结果将显示过敏原、其来源和置信度。',
    howItWorksStep4: '在“档案”部分添加您已知的过敏原，以个性化结果。',
    howItWorksIngredientsTitle: '配料表扫描如何工作',
    howItWorksIngredientsStep1: "1. 上传清晰的产品配料表图片。",
    howItWorksIngredientsStep2: "2. 我们的人工智能将读取文本并识别列出的潜在过敏原。",
    howItWorksIngredientsStep3: "3. 结果将显示识别出的过敏原及其来源文本片段。",
    howItWorksIngredientsStep4: "在“档案”中添加您已知的过敏原以个性化结果。",
    analysisCompleteTitle: '分析完成',
    analysisCompleteDescription: '已从图片中识别潜在的过敏原及其来源。',
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

    // Mode Switch and Camera Mode
    currentMode: "当前模式: {mode}",
    uploadModeLabel: "上传图片",
    cameraModeLabel: "使用相机",
    captureButton: "拍照",
    cameraPermissionDeniedTitle: "相机访问被拒绝",
    cameraPermissionDeniedDesc: "请在浏览器设置中启用相机权限以使用此功能。",
    cameraAccessRequired: "需要相机访问权限",
    cameraAccessRequiredDesc: "请允许访问相机以使用此功能。",
    cameraInitializing: "正在初始化相机...",
    noCameraDetected: "未检测到相机或权限被拒绝。",
    imagePreview: "图片预览",
    useThisPhotoButton: "使用这张照片",
    retakePhotoButton: "重新拍摄",
    allergensFoundCount: '发现 {count} 个过敏原',
    includesYourAllergy: '(包含您的过敏原!)',
    switchToUploadMode: '切换到上传模式',
    switchToCameraMode: '切换到相机模式',
  },

  // AllergenResults Component
  allergenResults: {
    title: '过敏原分析',
    description: '已识别的潜在过敏原。与您档案匹配的过敏原将被高亮显示。',
    noAllergensDetected: '未检测到过敏原',
    noAllergensInfo: '我们的分析未发现任何常见的过敏原。但是，如果您有严重的过敏症，请务必仔细检查。',
    yourAllergyBadge: '您的过敏原',
    confidence: '置信度: {percentage}%',
    lowConfidenceInfo: '置信度较低。可能不存在。',
    sourceLabel: '来源: {source}',
    unknownSource: '来源: 未指定',
    extractedTextTitle: '提取的配料表文本:',
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
    allergensFoundCount: '发现 {count} 个过敏原',
    includesYourAllergy: '(包含您的过敏原!)',
    scannedFoodAlt: '已扫描的食物图片',
  },

  // Settings Page
  settings: {
    title: '开发者设置',
    description: '手动覆盖应用行为以便测试。设置将本地保存在您的浏览器中。',
    operatingModeTitle: '操作模式覆盖 (食物扫描)',
    modeAutomatic: '自动 (移动端：相机，桌面端：上传)',
    modeForceCamera: '强制相机模式 (用于桌面端测试)',
    modeForceUpload: '强制上传模式',
    settingsSaved: '设置已保存！',
    settingsSavedDesc: '您的首选操作模式已更新。',
  },

  // AI Interaction Prompts
  aiPrompt: {
    systemInstruction: "你是一个从图片中识别食物潜在过敏原的人工智能。请分析图片。你的回答必须使用 {locale}。",
    jsonStructure: "请以JSON对象格式回应，其中包含一个名为 'allergens' 的键。'allergens' 键对应一个对象数组。数组中的每个对象必须包含三个键：'allergen' (一个字符串，表示识别出的过敏原名称，使用 {locale}，例如：'花生'、'麸质'、'乳制品')，'confidence' (一个0.0到1.0之间（含）的数字，表示你对此过敏原存在的置信度)，以及 'sourceFoodItem' (一个可选的字符串，使用 {locale} 描述图片中该过敏原的具体食物来源，例如：'饼干'，'沙拉酱')。如果你在图片中未识别到任何过敏原，'allergens' 数组应为空。",
    userAllergyContext: "请仅关注图片中可见或强烈暗示的成分。对于每个识别出的过敏原，请在 'sourceFoodItem' 字段中指明其在图片中的可能食物来源，并以 {locale} 进行描述。请进行全面分析，列出您可以从图像中推断出的所有*潜在*过敏原，即使它们的存在只是疑似或不太确定。您的目标是尽可能详尽地识别潜在风险。作为参考，用户已知有以下过敏史（以其当前输入语言记录）：{knownAllergiesString}。然而，你的主要任务是从图片本身识别所有潜在的过敏原及其来源，并以 {locale} 列出过敏原名称和来源描述。",
    identifyRequest: "请识别此食物图片中的过敏原。请用 {locale} 列出过敏原名称。",

    ingredientsSystemInstruction: "你是一个人工智能，负责从配料表图片中提取文本，然后从提取的文本中识别潜在的过敏原。你的回答必须使用 {locale}。",
    ingredientsJsonStructure: "请以JSON对象格式回应。此对象必须包含两个键：'extractedText' (一个字符串，包含你从配料表图片中读取到的所有文本) 和 'allergens' (一个对象数组)。'allergens' 数组中的每个对象必须包含三个键：'allergen' (一个字符串，表示识别出的过敏原名称，使用 {locale}，例如：'花生'、'麸质'、'奶粉')，'confidence' (一个0.0到1.0之间（含）的数字，表示你根据文本判断此过敏原存在的置信度)，以及 'sourceFoodItem' (一个字符串，使用 {locale} 表示从提取文本中指示此过敏原的确切短语或成分，例如：'大豆卵磷脂'、'小麦粉')。如果未识别到过敏原，'allergens' 数组应为空。如果无法提取到文本，'extractedText' 应为空字符串，'allergens' 数组也应为空。",
    ingredientsUserAllergyContext: "首先，请准确地将提供的配料表图片中的所有文本转录到 'extractedText' 字段。然后，从这个 'extractedText' 中识别所有潜在的过敏原。对于每个识别出的过敏原，请在 'allergen' 字段中提供其 {locale} 名称，在 'confidence' 字段中提供你的置信度，并在 'sourceFoodItem' 字段中提供指示此过敏原的配料表中的确切文本片段（也使用 {locale}）。请列出您可以从文本中推断出的所有*潜在*过敏原，即使它们的存在只是疑似或不太确定。您的目标是尽可能详尽。作为参考，用户已知有以下过敏史（以其当前输入语言记录）：{knownAllergiesString}。您的主要任务是分析提供的配料表图片。",
    ingredientsIdentifyRequest: "请从此配料表图片中提取文本，并从文本中识别所有潜在的过敏原。请用 {locale} 列出过敏原名称及其来源文本片段。",
  },

  // Global Metadata
  metadata: {
    title: '过敏眼 - 食物过敏原扫描器',
    description: '通过拍照或扫描配料表识别食物过敏原。支持英语、简体中文和繁体中文。',
  },

  // Language Switcher
  languageSwitcher: {
    placeholder: '语言',
    en: 'English',
    zhCN: '简体中文',
    zhTW: '繁體中文',
  },
};
