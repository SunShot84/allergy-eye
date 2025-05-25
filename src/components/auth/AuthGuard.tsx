"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isAuthCheckComplete, isLoading } = useAuth();
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  useEffect(() => {
    if (isAuthCheckComplete && !isAuthenticated && !isLoading) {
      router.push(`/${currentLocale}/login`);
    }
  }, [isAuthenticated, isAuthCheckComplete, isLoading, router, currentLocale]);

  if (!isAuthCheckComplete || isLoading) {
    // Show a loading spinner or a blank screen while auth check is in progress
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and redirect hasn't happened yet (e.g., during effect run),
  // render null or a minimal placeholder to avoid flashing content.
  // The redirect will kick in shortly.
  return null; 
} 