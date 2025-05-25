"use client";

import { Monitor, Home, Camera, History, User } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { usePathname } from 'next/navigation';

export function MobileNav({ locale }: { locale: string }) {
  const t = useI18n();
  const pathname = usePathname();
  
  // 判断是否为摄像头页面
  const isCameraPage = pathname === `/${locale}/m` || pathname === `/m`;

  return (
    <>
      {/* 只在非摄像头页面显示顶部导航栏 */}
      {!isCameraPage && (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex-1">
            <Link href={`/${locale}`} className="text-lg font-semibold">
              Allergy Eye
            </Link>
          </div>
          <LanguageSwitcher />
          <Link href={`/${locale}`} passHref legacyBehavior>
            <Button variant="ghost" size="icon" className="mr-2">
              <Monitor className="h-5 w-5" />
              <span className="sr-only">电脑版</span>
            </Button>
          </Link>
        </header>
      )}
      
      {/* 底部导航栏 */}
      {!isCameraPage && (
          <footer className="fixed bottom-0 left-0 right-0 border-t py-2 px-4 bg-background z-50">
          <nav className="flex justify-around">
            <Link 
              href={`/${locale}/m`} 
              className={`flex flex-col items-center text-sm ${
                pathname === `/${locale}/m` ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Camera className="h-6 w-6 mb-1" />
              <span>扫描</span>
            </Link>
            <Link 
              href={`/${locale}/m/history`} 
              className={`flex flex-col items-center text-sm ${
                pathname.includes('/history') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <History className="h-6 w-6 mb-1" />
              <span>历史</span>
            </Link>
            <Link 
              href={`/${locale}/m/profile`} 
              className={`flex flex-col items-center text-sm ${
                pathname.includes('/profile') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className="h-6 w-6 mb-1" />
              <span>我的</span>
            </Link>
            <Link 
              href={`/${locale}`} 
              className="flex flex-col items-center text-sm text-muted-foreground"
            >
              <Monitor className="h-6 w-6 mb-1" />
              <span>电脑版</span>
            </Link>
          </nav>
        </footer>
      )}
    
    </>
  );
} 