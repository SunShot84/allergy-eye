"use client";

import React from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogoIcon } from '@/components/icons/logo-icon';
import { SidebarNav } from './sidebar-nav';
import { Copyright } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useLoading } from '@/contexts/loading-context';
import { FullScreenLoader } from './full-screen-loader';
import { Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isLoading } = useLoading();
  const router = useRouter();

  return (
    <SidebarProvider defaultOpen >
      {isLoading && <FullScreenLoader />}
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <LogoIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              {t('appName')}
            </span>
          </Link>
        </SidebarHeader>
        <Separator className="my-0 group-data-[collapsible=icon]:hidden" />
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <Separator className="my-0 group-data-[collapsible=icon]:hidden" />
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center text-xs text-muted-foreground">
            <Copyright className="mr-1 h-3 w-3" />
            <span>{new Date().getFullYear()} {t('appName')}</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:px-8">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            {/* Placeholder for potential breadcrumbs or page title */}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${currentLocale}/m`)}
            className="mr-2"
          >
            <Smartphone className="h-5 w-5" />
            <span className="sr-only">移动版</span>
          </Button>
          <LanguageSwitcher />
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
