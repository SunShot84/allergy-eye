"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Monitor } from 'lucide-react';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useLoading } from '@/contexts/loading-context';
import { FullScreenLoader } from './full-screen-loader';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const { isLoading } = useLoading();

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && <FullScreenLoader />}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex-1">
          <Link href={`/${currentLocale}`} className="text-lg font-semibold">
            {t('appName')}
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${currentLocale}`)}
          className="mr-2"
        >
          <Monitor className="h-5 w-5" />
          <span className="sr-only">电脑版</span>
        </Button>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
} 