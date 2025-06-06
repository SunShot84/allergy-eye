
'use client';
import { createI18nClient } from 'next-international/client';
import en from '@/locales/en';
import zhCN from '@/locales/zh-CN';
import zhTW from '@/locales/zh-TW';

export const { useI18n, useScopedI18n, I18nProviderClient, useCurrentLocale, useChangeLocale } = createI18nClient(
  {
    en: () => Promise.resolve({ default: en }),
    'zh-CN': () => Promise.resolve({ default: zhCN }),
    'zh-TW': () => Promise.resolve({ default: zhTW }),
  }
);
