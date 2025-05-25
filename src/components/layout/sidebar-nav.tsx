"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, UserCircle, Cog, LogIn, UserPlus, LogOut } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isAuthenticated, user, logout, isLoading: actionIsLoading, isAuthCheckComplete } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = `/${currentLocale}/login`;
  };

  // 检查路径是否匹配，支持多路径匹配
  const isPathMatch = (targetPath: string | string[]) => {
    const paths = Array.isArray(targetPath) ? targetPath : [targetPath];
    const localePrefixedRoot = `/${currentLocale}`;
    
    return paths.some(path => {
      if (path === '/') {
        return pathname === '/' || pathname === localePrefixedRoot;
      }
      
      // 生成所有可能的路径变体
      const pathVariants = [
        path,
        path.startsWith('/') ? `${localePrefixedRoot}${path}` : path,
        path.startsWith(`/${currentLocale}/`) ? path.replace(`/${currentLocale}/`, '/') : path
      ];
      
      return pathVariants.includes(pathname);
    });
  };

  let navItems = [];

  if (!isAuthCheckComplete || actionIsLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{t('auth.loadingNavigation')}</p>
      </div>
    );
  }

  if (isAuthenticated) {
    navItems = [
      { href: '/', label: t('nav.scanFood'), icon: Home },
      { href: `/${currentLocale}/history`, label: t('nav.scanHistory'), icon: History },
      { href: `/${currentLocale}/profile`, label: t('nav.allergyProfile'), icon: UserCircle },
      { href: `/${currentLocale}/settings`, label: t('nav.settings'), icon: Cog },
    ];
  } else {
    navItems = [
      { href: '/', label: t('nav.scanFood'), icon: Home },
      { 
        href: `/${currentLocale}/login`, 
        matchPaths: ['/login', `/${currentLocale}/login`],
        label: t('auth.loginTitle'), 
        icon: LogIn 
      },
      { 
        href: `/${currentLocale}/register`,
        matchPaths: ['/register', `/${currentLocale}/register`],
        label: t('auth.registerTitle'), 
        icon: UserPlus 
      },
    ];
  }

  return (
    <SidebarMenu className="flex flex-col h-full">
      <div className="flex-grow space-y-1">
        {navItems.map((item) => {
          const isActive = isPathMatch(item.matchPaths || item.href);
          
          return (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href === '/' ? `/${currentLocale}` : item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={isActive}
                  className={cn(
                    "w-full justify-start",
                    isActive
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
      </div>
      {isAuthenticated && user && (
        <div className="p-2 mt-auto group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-t">
          <SidebarMenuItem className="group-data-[collapsible=icon]:py-2">
            <SidebarMenuButton
              onClick={handleLogout}
              className={cn(
                "w-full hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center"
              )}
              tooltip={t('auth.logoutButton')}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                {user.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="flex-grow truncate group-data-[collapsible=icon]:hidden">
                {user.username}
              </span>
              <LogOut className="h-5 w-5 ml-auto shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      )}
    </SidebarMenu>
  );
}
