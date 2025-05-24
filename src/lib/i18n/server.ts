import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } = createI18nServer(
  {
    en: () => import('@/locales/en'),
    'zh-CN': () => import('@/locales/zh-CN'),
    'zh-TW': () => import('@/locales/zh-TW'),
  },
  {
    // Explicitly set the default locale for the server-side functions
    // This ensures consistency with the middleware's defaultLocale.
    defaultLocale: 'en',
  }
);
