"use client";

import React from 'react';
import { ProfileForm } from '@/components/allergy-eye/profile-form';
import useLocalStorage from '@/hooks/use-local-storage';
import { ALLERGY_PROFILE_STORAGE_KEY } from '@/lib/constants';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    ALLERGY_PROFILE_STORAGE_KEY,
    { knownAllergies: [] }
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
              Why Add Allergies?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-secondary-foreground space-y-2">
            <p>Adding your known allergies helps AllergyEye personalize your experience:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Prioritized Warnings:</strong> Allergens you're sensitive to will be highlighted more prominently in scan results.</li>
              <li><strong>Tailored Insights:</strong> Future features may use this information to provide more specific advice.</li>
            </ul>
            <p className="font-medium">Your privacy is important. This information is stored locally on your device and is not shared.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
