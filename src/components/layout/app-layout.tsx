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

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen >
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <LogoIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              AllergyEye
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
            <span>{new Date().getFullYear()} AllergyEye</span>
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
          {/* Placeholder for user menu or actions */}
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
