
"use client";

import React, { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/allergy-eye/image-uploader';
import { CameraModeUI } from '@/components/allergy-eye/camera-mode-ui';
import { ModeToggleSwitch } from '@/components/allergy-eye/mode-toggle-switch';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import { analyzeFoodImage, analyzeIngredientsListImage, type AllergenAnalysisResult } from '@/app/[locale]/actions';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ALLERGY_PROFILE_STORAGE_KEY, 
  SCAN_HISTORY_STORAGE_KEY, 
  MAX_HISTORY_ITEMS,
  DEV_PREFERRED_MODE_STORAGE_KEY,
  type DevPreferredMode
} from '@/lib/constants';
import type { UserProfile, ScanResultItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from 'lucide-react';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';

const HomePage_INITIAL_USER_PROFILE: UserProfile = { knownAllergies: [] };
const HomePage_INITIAL_SCAN_HISTORY: ScanResultItem[] = [];
const HomePage_INITIAL_DEV_MODE: DevPreferredMode = 'automatic';

type OperatingMode = 'upload' | 'camera'; 
type ScanType = 'food' | 'ingredients';

export default function HomePage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysisResult | null>(null);
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(ALLERGY_PROFILE_STORAGE_KEY, HomePage_INITIAL_USER_PROFILE);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResultItem[]>(SCAN_HISTORY_STORAGE_KEY, HomePage_INITIAL_SCAN_HISTORY);
  const [devPreferredMode] = useLocalStorage<DevPreferredMode>(DEV_PREFERRED_MODE_STORAGE_KEY, HomePage_INITIAL_DEV_MODE);

  const isMobile = useIsMobile();
  const [foodOperatingMode, setFoodOperatingMode] = useState<OperatingMode>('upload');
  const [ingredientsOperatingMode, setIngredientsOperatingMode] = useState<OperatingMode>('upload');
  const [scanType, setScanType] = useState<ScanType>('food');
  const [clientSideReady, setClientSideReady] = useState(false);

  useEffect(() => {
    setClientSideReady(true);
    let initialMode: OperatingMode = 'upload';
    if (devPreferredMode === 'force_camera') {
      initialMode = 'camera';
    } else if (devPreferredMode === 'force_upload') {
      initialMode = 'upload';
    } else { // 'automatic'
      initialMode = isMobile ? 'camera' : 'upload';
    }
    setFoodOperatingMode(initialMode);
    setIngredientsOperatingMode(initialMode);
  }, [isMobile, devPreferredMode]);


  const processImageDataUrl = async (dataUrl: string, currentScanType: ScanType) => {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results

    try {
      let result: AllergenAnalysisResult;
      if (currentScanType === 'food') {
        result = await analyzeFoodImage(dataUrl, userProfile.knownAllergies, currentLocale);
      } else { // ingredients
        result = await analyzeIngredientsListImage(dataUrl, userProfile.knownAllergies, currentLocale);
      }
      setAnalysisResult(result);

      const newHistoryItem: ScanResultItem = {
        id: new Date().toISOString() + '-' + Math.random().toString(36).substring(2,9),
        imageDataUrl: dataUrl,
        identifiedAllergens: result.identifiedAllergens,
        prioritizedAllergens: result.prioritizedAllergens,
        userProfileAllergiesAtScanTime: userProfile.knownAllergies,
        timestamp: Date.now(),
        foodDescription: result.foodDescription, // Might be undefined for ingredients
        extractedText: result.extractedText, // Might be undefined for food
        scanType: currentScanType,
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
  
  const handleFoodFileSelected = (file: File, dataUrl: string) => {
    processImageDataUrl(dataUrl, 'food');
  };

  const handleIngredientsFileSelected = (file: File, dataUrl: string) => {
    processImageDataUrl(dataUrl, 'ingredients');
  };

  const handleFoodPhotoCaptured = (dataUrl: string) => {
    processImageDataUrl(dataUrl, 'food');
  };

  const handleIngredientsPhotoCaptured = (dataUrl: string) => {
    processImageDataUrl(dataUrl, 'ingredients');
  };

  const handleFoodModeChange = (newMode: OperatingMode) => {
    setFoodOperatingMode(newMode);
    setAnalysisResult(null); // Clear results when changing mode
  };

  const handleIngredientsModeChange = (newMode: OperatingMode) => {
    setIngredientsOperatingMode(newMode);
    setAnalysisResult(null); // Clear results when changing mode
  };

  const handleScanTypeChange = (newScanType: string) => {
    setScanType(newScanType as ScanType);
    setAnalysisResult(null); // Clear results when changing scan type
  }
  
  if (!clientSideReady) {
    // Basic loading state to prevent hydration mismatch issues with isMobile/devPreferredMode
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-8">
         <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-center">Loading...</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-b-lg"></CardContent>
        </Card>
      </div>
    );
  }

  const foodScanUploaderTitle = t('home.uploadTitle');
  const foodScanUploaderDescription = t('home.uploadDescription');
  const ingredientsScanUploaderTitle = t('home.uploadIngredientsTitle');
  const ingredientsScanUploaderDescription = t('home.uploadIngredientsDescription');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <Tabs value={scanType} onValueChange={handleScanTypeChange} className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="food">{t('home.scanFoodTab')}</TabsTrigger>
            <TabsTrigger value="ingredients">{t('home.scanIngredientsTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="food" className="mt-6">
            {clientSideReady && (isMobile || devPreferredMode !== 'automatic') && (
              <div className="mb-6 flex justify-center">
                <ModeToggleSwitch
                  currentMode={foodOperatingMode}
                  onModeChange={handleFoodModeChange}
                />
              </div>
            )}
            {foodOperatingMode === 'upload' ? (
              <ImageUploader 
                onImageUpload={handleFoodFileSelected} 
                isLoading={isLoading && scanType === 'food'} 
                uploaderTitle={foodScanUploaderTitle}
                uploaderDescription={foodScanUploaderDescription}
                imageAltText={t('home.uploadTitle')}
              />
            ) : (
              <CameraModeUI 
                onPhotoCaptured={handleFoodPhotoCaptured} 
                isLoading={isLoading && scanType === 'food'} 
              />
            )}
          </TabsContent>
          <TabsContent value="ingredients" className="mt-6">
            {clientSideReady && (isMobile || devPreferredMode !== 'automatic') && (
              <div className="mb-6 flex justify-center">
                <ModeToggleSwitch
                  currentMode={ingredientsOperatingMode}
                  onModeChange={handleIngredientsModeChange}
                />
              </div>
            )}
            {ingredientsOperatingMode === 'upload' ? (
              <ImageUploader 
                onImageUpload={handleIngredientsFileSelected} 
                isLoading={isLoading && scanType === 'ingredients'}
                uploaderTitle={ingredientsScanUploaderTitle}
                uploaderDescription={ingredientsScanUploaderDescription}
                imageAltText={t('home.uploadIngredientsTitle')}
              />
            ) : (
              <CameraModeUI 
                onPhotoCaptured={handleIngredientsPhotoCaptured} 
                isLoading={isLoading && scanType === 'ingredients'} 
              />
            )}
          </TabsContent>
        </Tabs>
        
        {analysisResult && (
          <AllergenResults 
            analysisResult={analysisResult}
            userProfile={userProfile} 
            setUserProfile={setUserProfile}
          />
        )}

        {!analysisResult && !isLoading && (
           <Card className="w-full max-w-lg mx-auto mt-6 bg-secondary/50 border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="h-5 w-5 mr-2 text-secondary-foreground" />
                {scanType === 'food' ? t('home.howItWorksTitle') : t('home.howItWorksIngredientsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-secondary-foreground space-y-2">
              <p>{scanType === 'food' ? t('home.howItWorksStep1') : t('home.howItWorksIngredientsStep1')}</p>
              <p>{scanType === 'food' ? t('home.howItWorksStep2') : t('home.howItWorksIngredientsStep2')}</p>
              <p>{scanType === 'food' ? t('home.howItWorksStep3') : t('home.howItWorksIngredientsStep3')}</p>
              <p>{scanType === 'food' ? t('home.howItWorksStep4') : t('home.howItWorksIngredientsStep4')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    
