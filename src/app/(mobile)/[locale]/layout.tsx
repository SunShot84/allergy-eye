import { Metadata, Viewport } from 'next';
import { MobileNav } from '@/components/layout/mobile-nav';
import { I18nProviderClient } from '@/lib/i18n/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/loading-context';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: '移动版 - Allergy Eye',
  description: 'Allergy Eye 移动版界面',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProviderClient locale={params.locale}>
          <LoadingProvider>
            <AuthProvider>
              <SettingsProvider>
                <div className="min-h-screen flex flex-col bg-background">
                  <MobileNav locale={params.locale} />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <Toaster />
              </SettingsProvider>
            </AuthProvider>
          </LoadingProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
} 