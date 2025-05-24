
// REMOVED 'use client'; - This file is now a Server Component

import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { I18nProviderClient } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';

const geistSans = GeistSans;
const geistMono = GeistMono;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  // getI18n() will use the locale from the current request context (derived from params.locale by middleware)
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

export default async function RootLayout({ // Made this function async
  children,
  params, 
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string }; 
}>) {
  const locale = params.locale; // Now correctly accessed in an async function

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={locale} key={locale}> {/* Pass the server-determined locale */}
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </I18nProviderClient>
      </body>
    </html>
  );
}
