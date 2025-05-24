
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { I18nProviderClient } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';
import { LoadingProvider } from '@/contexts/loading-context'; // Added import

const geistSans = GeistSans;
const geistMono = GeistMono;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getI18n(); // getI18n will use the locale from params
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
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = params.locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={locale} key={locale}>
          <LoadingProvider> {/* Added LoadingProvider */}
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </LoadingProvider> {/* Added LoadingProvider */}
        </I18nProviderClient>
      </body>
    </html>
  );
}
