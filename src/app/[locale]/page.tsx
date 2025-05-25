"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from '@/components/allergy-eye/image-uploader';
import { CameraModeUI } from '@/components/allergy-eye/camera-mode-ui';
import { ModeToggleSwitch } from '@/components/allergy-eye/mode-toggle-switch';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import { analyzeFoodImage, analyzeIngredientsListImage, type AllergenAnalysisResult } from '@/app/[locale]/actions';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DEV_PREFERRED_MODE_STORAGE_KEY,
  type DevPreferredMode
} from '@/lib/constants';
import type { ScanResultItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from 'lucide-react';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCachedLocation, type IpLocation, refreshLocation } from '@/lib/services/geo-location';
import { useSettings } from '@/contexts/SettingsContext';

const HomePage_INITIAL_DEV_MODE: DevPreferredMode = 'automatic';
const IP_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟

type OperatingMode = 'upload' | 'camera'; 
type ScanType = 'food' | 'ingredients';

export default function HomePage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { token, isAuthenticated, user } = useAuth();
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysisResult | null>(null);
  const { toast } = useToast();

  const knownAllergies = user?.profile?.knownAllergies || [];

  const [devPreferredModeSetting] = useLocalStorage<DevPreferredMode>(DEV_PREFERRED_MODE_STORAGE_KEY, HomePage_INITIAL_DEV_MODE);

  const isMobile = useIsMobile();
  const [foodOperatingMode, setFoodOperatingMode] = useState<OperatingMode>('upload');
  const [ingredientsOperatingMode, setIngredientsOperatingMode] = useState<OperatingMode>('upload');
  const [scanType, setScanType] = useState<ScanType>('food');
  const [clientSideReady, setClientSideReady] = useState(false);

  // 获取缓存的位置信息
  const [ipLocation, setIpLocation] = useState<IpLocation | null>(null);

  // 刷新IP地址的函数
  const updateIpLocation = useCallback(async () => {
    if (!settings.allowIpAddress) {
      setIpLocation(null);
      return;
    }

    try {
      const newLocation = await refreshLocation();
      setIpLocation(newLocation);
    } catch (error) {
      console.error('Failed to refresh IP location:', error);
    }
  }, [settings.allowIpAddress]);

  // 初始化和定时更新IP地址
  useEffect(() => {
    // 初始加载时获取IP
    updateIpLocation();

    // 设置定时器，每5分钟更新一次
    const intervalId = setInterval(updateIpLocation, IP_REFRESH_INTERVAL);

    // 清理函数
    return () => {
      clearInterval(intervalId);
    };
  }, [updateIpLocation]);

  // 当设置改变时更新IP地址
  useEffect(() => {
    updateIpLocation();
  }, [settings.allowIpAddress, updateIpLocation]);

  useEffect(() => {
    setClientSideReady(true);
    let initialMode: OperatingMode = 'upload';
    if (devPreferredModeSetting === 'force_camera') {
      initialMode = 'camera';
    } else if (devPreferredModeSetting === 'force_upload') {
      initialMode = 'upload';
    } else { // 'automatic'
      initialMode = isMobile ? 'camera' : 'upload';
    }
    setFoodOperatingMode(initialMode);
    setIngredientsOperatingMode(initialMode);
  }, [isMobile, devPreferredModeSetting]);

  const processImageDataUrl = useCallback(async (dataUrl: string, currentScanType: ScanType) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      let result: AllergenAnalysisResult;
      if (currentScanType === 'food') {
        result = await analyzeFoodImage(dataUrl, knownAllergies, currentLocale, ipLocation || undefined);
      } else {
        result = await analyzeIngredientsListImage(dataUrl, knownAllergies, currentLocale, ipLocation || undefined);
      }
      setAnalysisResult(result);

      const historyDataToSend: Omit<ScanResultItem, 'id' | 'timestamp'> = {
        imageDataUrl: dataUrl,
        identifiedAllergens: result.identifiedAllergens,
        prioritizedAllergens: result.prioritizedAllergens,
        userProfileAllergiesAtScanTime: knownAllergies,
        foodDescription: result.foodDescription, 
        extractedText: result.extractedText,
        scanType: currentScanType,
      };

      if (isAuthenticated && token) {
        try {
          const response = await fetch('/api/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(historyDataToSend),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to save scan to history' }));
            throw new Error(errorData.message || `HTTP error ${response.status} while saving history`);
          }
          toast({ title: t('home.scanSavedToHistoryTitle'), description: t('home.scanSavedToHistoryDesc') });

        } catch (historyError: any) {
          console.error("Error saving scan to history:", historyError);
          toast({
            title: t('home.scanHistorySaveErrorTitle'),
            description: `${t('home.scanHistorySaveErrorDesc')} ${historyError.message || ''}`,
          });
        }
      } else {
        toast({
          title: t('home.scanNotSavedTitle'),
          description: t('home.scanNotSavedDescription'),
        });
      }
      
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
  }, [knownAllergies, currentLocale, isAuthenticated, token, t, toast, ipLocation]);
  
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
    setAnalysisResult(null);
  };

  const handleIngredientsModeChange = (newMode: OperatingMode) => {
    setIngredientsOperatingMode(newMode);
    setAnalysisResult(null);
  };

  const handleScanTypeChange = (newScanType: string) => {
    setScanType(newScanType as ScanType);
    setAnalysisResult(null);
  }
  
  if (!clientSideReady) {
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
            {clientSideReady && (isMobile || devPreferredModeSetting !== 'automatic') && (
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
            {clientSideReady && (isMobile || devPreferredModeSetting !== 'automatic') && (
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
            userProfile={{ knownAllergies: knownAllergies }}
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

    
