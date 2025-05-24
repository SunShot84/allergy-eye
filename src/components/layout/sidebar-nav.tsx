
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, UserCircle, Cog } from 'lucide-react'; // Added Cog
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
    { href: '/settings', label: t('nav.settings'), icon: Cog }, // New Settings item
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // For the main page, pathname might be just `/[locale]`.
        // For other pages, it will be `/[locale]/path`.
        // We need to ensure the link href correctly reflects this relative to the current locale.
        // However, Link component handles this automatically if we just provide the base path.
        const baseHref = item.href === '/' ? '' : item.href;
        const isActive = pathname.endsWith(baseHref) || (baseHref === '' && (pathname === '/en' || pathname === '/zh-CN' || pathname === '/zh-TW'));
        
        // A more robust way for root path matching across locales
        const isRootActive = item.href === '/' && (
          pathname === '/en' || pathname === '/zh-CN' || pathname === '/zh-TW' ||
          pathname === '/' // for the case where locale might be missing if not yet redirected by middleware
        );
        const isSubPathActive = item.href !== '/' && pathname.includes(item.href);


        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isRootActive || isSubPathActive}
                className={cn(
                  "w-full justify-start",
                  (isRootActive || isSubPathActive)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
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
