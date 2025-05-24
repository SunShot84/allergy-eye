
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, UserCircle } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/client';

export function SidebarNav() {
  const pathname = usePathname();
  const t = useI18n();

  const navItems = [
    { href: '/', label: t('nav.scanFood'), icon: Home },
    { href: '/history', label: t('nav.scanHistory'), icon: History },
    { href: '/profile', label: t('nav.allergyProfile'), icon: UserCircle },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isActive}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-black/5 dark:hover:bg-white/5" // Subtle hover for non-active items
                )}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
