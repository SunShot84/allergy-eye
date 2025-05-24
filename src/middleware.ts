import type { NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'zh-CN', 'zh-TW'],
  defaultLocale: 'en',
  urlMappingStrategy: 'rewrite', 
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|public).*)'],
};
