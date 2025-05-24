
"use client";

import React, { useState } from 'react';
import { ImageUploader } from '@/components/allergy-eye/image-uploader';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import { analyzeFoodImage, type AllergenAnalysisResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { ALLERGY_PROFILE_STORAGE_KEY, SCAN_HISTORY_STORAGE_KEY, MAX_HISTORY_ITEMS } from '@/lib/constants';
import type { UserProfile, ScanResultItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

const HomePage_INITIAL_USER_PROFILE: UserProfile = { knownAllergies: [] };
const HomePage_INITIAL_SCAN_HISTORY: ScanResultItem[] = [];

export default function HomePage() {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysisResult | null>(null);
  // const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Keep track of uploaded image for history - removed as it's part of newHistoryItem
  const { toast } = useToast();

  const [userProfile] = useLocalStorage<UserProfile>(ALLERGY_PROFILE_STORAGE_KEY, HomePage_INITIAL_USER_PROFILE);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResultItem[]>(SCAN_HISTORY_STORAGE_KEY, HomePage_INITIAL_SCAN_HISTORY);

  const handleImageUpload = async (file: File, dataUrl: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    // setUploadedImage(dataUrl); // Store for history saving

    try {
      const result = await analyzeFoodImage(dataUrl, userProfile.knownAllergies);
      setAnalysisResult(result);

      const newHistoryItem: ScanResultItem = {
        id: new Date().toISOString() + '-' + Math.random().toString(36).substring(2,9),
        imageDataUrl: dataUrl,
        identifiedAllergens: result.identifiedAllergens,
        prioritizedAllergens: result.prioritizedAllergens,
        userProfileAllergiesAtScanTime: userProfile.knownAllergies,
        timestamp: Date.now(),
        foodDescription: result.foodDescription,
      };
      
      setScanHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
      });

      toast({
        title: t('home.analysisCompleteTitle'),
        description: t('home.analysisCompleteDescription'),
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: t('home.analysisFailedTitle'),
        description: t('home.analysisFailedDescription'),
        variant: "destructive",
      });
      setAnalysisResult(null); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
        
        {analysisResult && (
          <AllergenResults 
            analysisResult={analysisResult}
            userProfileAllergies={userProfile.knownAllergies} 
          />
        )}

        {!analysisResult && !isLoading && (
           <Card className="w-full max-w-lg mx-auto mt-6 bg-secondary/50 border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="h-5 w-5 mr-2 text-secondary-foreground" />
                {t('home.howItWorksTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-secondary-foreground space-y-2">
              <p>{t('home.howItWorksStep1')}</p>
              <p>{t('home.howItWorksStep2')}</p>
              <p>{t('home.howItWorksStep3')}</p>
              <p>{t('home.howItWorksStep4')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
