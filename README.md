
# AllergyEye - 食物过敏原扫描应用
AllergyEye 是一款为易过敏人群，利用<b>视觉大模型</b>与<b>过敏原数据库</b>，精准识别食物成分，帮助判断是否会引起过敏。它利用生成式 AI 分析图像，并结合用户的个人过敏档案，提供个性化的风险提示。

## 核心功能

-   **图像上传**: 允许用户通过 Web 浏览器上传食物项目的图片。
-   **过敏原识别**: 使用生成式 AI 识别图片中的食物成分，并对照常见过敏原数据库，列出可能存在的过敏原。
-   **过敏原展示**:清晰地显示已识别的过敏原列表，并为每种过敏原提供一个置信度百分比，突出潜在风险。
-   **扫描历史**: 为用户保存扫描过的物品记录，方便查阅。
-   **个人过敏档案**: 允许用户输入已知的过敏症，以便在扫描结果中优先提示相关过敏原。

## 技术栈

-   **前端框架**: [Next.js](https://nextjs.org/) (使用 App Router)
-   **UI 库**: [React](https://reactjs.org/)
-   **UI 组件**: [ShadCN UI](https://ui.shadcn.com/)
-   **样式**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI 集成**: 使用 [OpenAI API](https://openai.com/product) (GPT-4 turbo)
-   **状态管理 (本地)**: `localStorage` (通过 `useLocalStorage` 钩子)
-   **图标**: [Lucide React](https://lucide.dev/)
-   **字体**: Geist Sans, Geist Mono

## 环境准备

在开始之前，请确保您的开发环境中安装了以下软件：

-   [Node.js](https://nodejs.org/) (建议使用 LTS 版本，例如 v18.x 或 v20.x)
-   [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装) 或 [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

## 安装与启动

1.  **克隆仓库 (如果您是从 git 仓库开始)**:
    ```bash
    git clone <your-repository-url>
    cd AllergyEye
    ```

2.  **安装依赖**:
    使用 npm:
    ```bash
    npm install
    ```
    或使用 yarn:
    ```bash
    yarn install
    ```
    或使用 pnpm:
    ```bash
    pnpm install
    ```

3.  **配置环境变量**:
    项目根目录下需要一个 `.env` 文件来存储敏感信息，例如 OpenAI API 密钥。
    复制 `.env.example` (如果存在) 或手动创建一个名为 `.env` 的文件，并填入以下内容：

    ```env
    OPENAI_API_KEY="sk-YOUR_OPENAI_API_KEY_HERE"
    ```
    请将 `sk-YOUR_OPENAI_API_KEY_HERE` 替换为您真实的 OpenAI API 密钥。您可以从 [OpenAI Platform](https://platform.openai.com/account/api-keys) 获取。

4.  **运行开发服务器**:
    ```bash
    npm run dev
    ```
    应用默认会在 `http://localhost:9002` (根据 `package.json` 中的 `dev` 脚本) 启动。

## 可用脚本

在 `package.json` 文件中，您可以找到以下常用脚本：

-   `npm run dev`: 以开发模式启动应用 (支持热重载, Turbopack)。
-   `npm run build`: 构建生产版本的应用。
-   `npm run start`: 启动生产版本的应用 (需要先执行 `build`)。
-   `npm run lint`: 运行 ESLint 代码检查。
-   `npm run typecheck`: 运行 TypeScript 类型检查。

### 如何添加或修改翻译？

1.  打开对应的语言文件 (例如 `src/locales/en.ts`)。
2.  找到您想修改的键值对，或添加新的键值对。
3.  确保所有语言文件都包含相同的键，以保证切换时不会出现文本缺失。


## 项目结构简介

```
AllergyEye/
├── .env                  # 环境变量 (需要您手动创建和配置)
├── next.config.ts        # Next.js 配置文件
├── package.json          # 项目依赖和脚本
├── tailwind.config.ts    # Tailwind CSS 配置文件
├── tsconfig.json         # TypeScript 配置文件
├── src/
│   ├── app/              # Next.js App Router 核心目录
│   │   ├── [locale]/     # 动态国际化路由
│   │   │   ├── layout.tsx  # 区域布局 (包含 I18nProviderClient)
│   │   │   ├── page.tsx    # 主扫描页面
│   │   │   ├── history/    # 扫描历史页面
│   │   │   ├── profile/    # 用户过敏档案页面
│   │   │   └── actions.ts  # Server Actions (例如调用 OpenAI API)
│   │   └── globals.css   # 全局样式和 ShadCN UI 主题变量
│   ├── components/       # 可复用 UI 组件
│   │   ├── allergy-eye/  # 应用特定组件 (如 ImageUploader, AllergenResults)
│   │   ├── i18n/         # 国际化相关组件 (如 LanguageSwitcher)
│   │   ├── layout/       # 布局组件 (如 AppLayout, SidebarNav)
│   │   └── ui/           # ShadCN UI 基础组件
│   ├── contexts/         # React Context (如 LoadingContext)
│   ├── hooks/            # 自定义 React Hooks (如 useLocalStorage, useToast)
│   ├── lib/              # 工具函数、常量、类型定义
│   │   ├── i18n/         # 国际化配置 (client.ts, server.ts)
│   │   └── types.ts      # TypeScript 类型定义
│   ├── locales/          # 翻译文件 (en.ts, zh-CN.ts, zh-TW.ts)
│   └── middleware.ts     # Next.js 中间件 (用于国际化路由处理)
└── ...                   # 其他配置文件
```

## 贡献

如果您有任何建议或发现 bug，请随时提出 Issue。
