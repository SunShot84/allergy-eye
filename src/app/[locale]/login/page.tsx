"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';

export default function LoginPage() {
  const { isAuthenticated, isLoading: actionIsLoading, isAuthCheckComplete } = useAuth();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 获取redirect参数
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    if (isAuthCheckComplete && isAuthenticated) {
      // 如果有redirect参数，跳转到指定URL，否则跳转到默认首页
      const targetPath = redirectTo || `/${currentLocale}`;
      if (pathname !== targetPath) {
        router.replace(targetPath);
      }
    }
  }, [isAuthenticated, isAuthCheckComplete, router, currentLocale, pathname, redirectTo]);

  if (!isAuthCheckComplete || (isAuthCheckComplete && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center">
        <p>{t('auth.checkingAuth')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
} 