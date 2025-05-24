
import { createI18nServer } from 'next-international/server';
import en from '@/locales/en';
import zhCN from '@/locales/zh-CN';
import zhTW from '@/locales/zh-TW';

export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } = createI18nServer(
  {
    en: () => Promise.resolve({ default: en }),
    'zh-CN': () => Promise.resolve({ default: zhCN }),
    'zh-TW': () => Promise.resolve({ default: zhTW }),
  },
  {
    // Explicitly set the default locale for the server-side functions
    // This ensures consistency with the middleware's defaultLocale.
    defaultLocale: 'en',
  }
);
