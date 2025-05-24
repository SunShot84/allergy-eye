
"use client";

import React from 'react';
import { ProfileForm } from '@/components/allergy-eye/profile-form';
import useLocalStorage from '@/hooks/use-local-storage';
import { ALLERGY_PROFILE_STORAGE_KEY } from '@/lib/constants';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

const ProfilePage_INITIAL_USER_PROFILE: UserProfile = { knownAllergies: [] };

export default function ProfilePage() {
  const t = useI18n();
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    ALLERGY_PROFILE_STORAGE_KEY,
    ProfilePage_INITIAL_USER_PROFILE
  );

  const handleSaveProfile = (allergies: string[]) => {
    setUserProfile({ knownAllergies: allergies.map(a => a.toLowerCase()) });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <ProfileForm 
          initialAllergies={userProfile.knownAllergies} 
          onSave={handleSaveProfile} 
        />
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
  );
}
