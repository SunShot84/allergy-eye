
"use client";

import React, { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/allergy-eye/image-uploader';
import { CameraModeUI } from '@/components/allergy-eye/camera-mode-ui';
import { ModeToggleSwitch } from '@/components/allergy-eye/mode-toggle-switch';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import { analyzeFoodImage, type AllergenAnalysisResult } from '@/app/[locale]/actions';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { ALLERGY_PROFILE_STORAGE_KEY, SCAN_HISTORY_STORAGE_KEY, MAX_HISTORY_ITEMS } from '@/lib/constants';
import type { UserProfile, ScanResultItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

const HomePage_INITIAL_USER_PROFILE: UserProfile = { knownAllergies: [] };
const HomePage_INITIAL_SCAN_HISTORY: ScanResultItem[] = [];

type OperatingMode = 'upload' | 'camera';

export default function HomePage() {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysisResult | null>(null);
  const { toast } = useToast();

  const [userProfile] = useLocalStorage<UserProfile>(ALLERGY_PROFILE_STORAGE_KEY, HomePage_INITIAL_USER_PROFILE);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResultItem[]>(SCAN_HISTORY_STORAGE_KEY, HomePage_INITIAL_SCAN_HISTORY);

  const isMobile = useIsMobile();
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('upload');
  const [clientSideReady, setClientSideReady] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after hydration
    setClientSideReady(true);
    setOperatingMode(isMobile ? 'camera' : 'upload');
  }, [isMobile]);


  const processImageDataUrl = async (dataUrl: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

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
        description: `${t('home.analysisFailedDescription')} ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      setAnalysisResult(null); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelected = (file: File, dataUrl: string) => {
    // file object can be used if needed e.g. for displaying filename
    processImageDataUrl(dataUrl);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    processImageDataUrl(dataUrl);
  };

  const handleModeChange = (newMode: OperatingMode) => {
    setOperatingMode(newMode);
    setAnalysisResult(null); // Clear previous results when mode changes
  };
  
  // Render placeholder or null until clientSideReady to avoid hydration mismatch for isMobile dependent UI
  if (!clientSideReady) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-8">
        {/* Basic placeholder matching the card structure can go here */}
         <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-center">Loading...</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-b-lg"></CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        
        {isMobile && (
          <ModeToggleSwitch
            currentMode={operatingMode}
            onModeChange={handleModeChange}
          />
        )}

        {operatingMode === 'upload' ? (
          <ImageUploader onImageUpload={handleFileSelected} isLoading={isLoading} />
        ) : (
          <CameraModeUI onPhotoCaptured={handlePhotoCaptured} isLoading={isLoading} />
        )}
        
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
                <Info className="h-5 w-5 mr-2 text-secondary-foreground" /> {/* Changed icon for neutrality */}
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
