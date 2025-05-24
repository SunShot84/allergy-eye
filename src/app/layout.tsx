
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { I18nProviderClient } from '@/lib/i18n/client';
import { getI18n, getCurrentLocale } from '@/lib/i18n/server';

const geistSans = GeistSans;
const geistMono = GeistMono;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  // params prop removed as getCurrentLocale() is the source of truth for resolvedLocale
}>) {
  let resolvedLocale = await getCurrentLocale();
  const definedLocales = ['en', 'zh-CN', 'zh-TW'];

  // Defensive check: Ensure resolvedLocale is one of the defined locales.
  // getCurrentLocale() should ideally handle this by falling back to defaultLocale
  // as configured in src/lib/i18n/server.ts.
  if (!definedLocales.includes(resolvedLocale)) {
    console.warn(
      `[RootLayout] getCurrentLocale() returned an unexpected locale '${resolvedLocale}'. Falling back to 'en'.`
    );
    resolvedLocale = 'en'; // Fallback to default locale
  }

  return (
    <html lang={resolvedLocale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={resolvedLocale}>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </I18nProviderClient>
      </body>
    </html>
  );
}
