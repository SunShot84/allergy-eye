import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { I18nProviderClient } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';
import { LoadingProvider } from '@/contexts/loading-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

const geistSans = GeistSans;
const geistMono = GeistMono;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
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
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const t = await getI18n();
  const locale = params.locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={locale} key={locale}>
          <LoadingProvider>
            <AuthProvider>
              <SettingsProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <Toaster />
              </SettingsProvider>
            </AuthProvider>
          </LoadingProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
