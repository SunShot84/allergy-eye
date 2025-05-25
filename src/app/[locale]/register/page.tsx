"use client";

import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';

export default function RegisterPage() {
  const { isAuthenticated, isLoading: actionIsLoading, isAuthCheckComplete } = useAuth();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthCheckComplete && isAuthenticated) {
      const targetPath = `/${currentLocale}`;
      if (pathname !== targetPath) {
        router.replace(targetPath);
      }
    }
  }, [isAuthenticated, isAuthCheckComplete, router, currentLocale, pathname]);

  if (!isAuthCheckComplete || (isAuthCheckComplete && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center">
        <p>{t('auth.checkingAuth')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4">
      <RegisterForm />
    </div>
  );
} 