"use client";

import React from 'react';
import { ProfileForm } from '@/components/allergy-eye/profile-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProfilePage() {
  const t = useI18n();

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center space-y-8">
          <ProfileForm />
          <Card className="w-full max-w-xl mx-auto bg-secondary/50 border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ShieldCheck className="h-5 w-5 mr-2 text-secondary-foreground" />
                {t('profile.whyAddAllergiesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-secondary-foreground space-y-2">
              <p>{t('profile.whyAddAllergiesInfo')}</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>{t('profile.whyAddAllergiesBenefit1')}</li>
                <li>{t('profile.whyAddAllergiesBenefit2')}</li>
              </ul>
              <p className="font-medium">{t('profile.privacyInfo')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
