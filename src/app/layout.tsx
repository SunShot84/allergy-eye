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

export default function RootLayout({
  children,
  params: { locale } 
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const currentActualLocale = getCurrentLocale(); // Use this for lang attribute
  return (
    <html lang={currentActualLocale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={locale}>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </I18nProviderClient>
      </body>
    </html>
  );
}
