"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { CameraView } from '@/components/mobile/camera-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, List, Loader2, History, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { analyzeFoodImage, analyzeIngredientsListImage, type AllergenAnalysisResult } from '@/app/[locale]/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCachedLocation, type IpLocation, refreshLocation } from '@/lib/services/geo-location';
import type { ScanResultItem } from '@/lib/types';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';

type ScanMode = 'food' | 'ingredients';

const IP_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟

export default function MobilePage() {
  const [scanMode, setScanMode] = useState<ScanMode>('food');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysisResult | null>(null);
  const [ipLocation, setIpLocation] = useState<IpLocation | null>(null);
  
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const { toast } = useToast();
  const { token, isAuthenticated, user } = useAuth();
  const { settings } = useSettings();

  const knownAllergies = user?.profile?.knownAllergies || [];

  // 获取缓存的位置信息
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
    updateIpLocation();
    const intervalId = setInterval(updateIpLocation, IP_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [updateIpLocation]);

  // 当设置改变时更新IP地址
  useEffect(() => {
    updateIpLocation();
  }, [settings.allowIpAddress, updateIpLocation]);

  const processImageDataUrl = useCallback(async (dataUrl: string, currentScanMode: ScanMode) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      let result: AllergenAnalysisResult;
      if (currentScanMode === 'food') {
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
        scanType: currentScanMode,
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

  const handleCapture = async (imageData: string) => {
    await processImageDataUrl(imageData, scanMode);
  };

  const handleModeChange = (newMode: ScanMode) => {
    setScanMode(newMode);
    setAnalysisResult(null);
  };

  return (
    <div className="h-screen overflow-hidden flex-1 relative">
      {/* 摄像头视图 */}
      <CameraView onCapture={handleCapture} />
      
      {/* 加载遮罩 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">
              {scanMode === 'food' ? t('mobile.analyzingFood') : t('mobile.analyzingIngredients')}
            </p>
            <p className="text-sm opacity-75 mt-2">
              {t('mobile.pleaseWait')}
            </p>
          </div>
        </div>
      )}

      {/* 分析结果遮罩 */}
      {analysisResult && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col z-[200] overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{t('mobile.analysisResult')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnalysisResult(null)}
              className="text-white text-xl hover:bg-white/20 rounded-full h-10 w-10 p-0"
            >
              <X className="size-6" />
            </Button>
          </div>
          
          {/* 滚动内容区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="max-w-lg mx-auto">
                {/* 结果组件 */}
                <div className="bg-white rounded-xl overflow-hidden shadow-xl">
                  <AllergenResults 
                    analysisResult={analysisResult}
                    userProfile={{ knownAllergies: knownAllergies }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="p-4 border-t border-white/10">
            <div className="max-w-lg mx-auto flex gap-3">
              <Button
                onClick={() => setAnalysisResult(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/30"
                variant="outline"
              >
                {t('mobile.scanAgain')}
              </Button>
              <Button
                onClick={() => router.push(`/${currentLocale}/m/history`)}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {t('mobile.viewHistory')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 底部模式切换 - 只在没有结果时显示 */}
      {!analysisResult && (
        <div className="absolute bottom-3 left-0 right-0 px-4 z-30">
          {/* 模式说明 */}
          <div className="text-center mb-2">
            <p className="text-white text-xs opacity-75">
              {scanMode === 'food' ? t('mobile.foodScanDesc') : t('mobile.ingredientsScanDesc')}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 scale-75">
            <Button
              variant={scanMode === 'food' ? 'default' : 'secondary'}
              onClick={() => handleModeChange('food')}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 text-lg rounded-full transition-all ${
                scanMode === 'food' 
                  ? 'bg-white text-black shadow-lg font-bold scale-105 hover:bg-white' 
                  : 'bg-black/50 text-white border border-white/30 hover:bg-white/10'
              }`}
            >
              <Utensils className="size-5" />
              <span>{t('mobile.scanFood')}</span>
              {scanMode === 'food' && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {t('mobile.default')}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={scanMode === 'ingredients' ? 'default' : 'secondary'}
              onClick={() => handleModeChange('ingredients')}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 text-lg rounded-full transition-all ${
                scanMode === 'ingredients' 
                  ? 'bg-white text-black shadow-lg font-bold scale-105 hover:bg-white' 
                  : 'bg-black/50 text-white border border-white/30 hover:bg-white/10'
              }`}
            >
              <List className="size-5" />
              <span>{t('mobile.scanIngredients')}</span>
              {scanMode === 'ingredients' && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {t('mobile.active')}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* 顶部模式指示器 - 只在没有结果时显示 */}
      {!analysisResult && (
        <div className="absolute top-16 left-0 right-0 px-4 z-20">
          <div className="flex justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <p className="text-white text-sm">
                {scanMode === 'food' ? `🍎 ${t('mobile.foodScanMode')}` : `📋 ${t('mobile.ingredientsScanMode')}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 左上角按钮 - 只在没有结果时显示 */}
      {!analysisResult && (
        <div className="absolute top-4 left-4 scale-80 z-50">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${currentLocale}/m/history`)}
              className="bg-black/60 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 flex flex-col items-center gap-1 h-auto p-2 min-w-[48px] rounded-lg transition-all"
            >
              <History className="h-4 w-4" />
              <span className="text-xs">{t('mobile.history')}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${currentLocale}/m/profile`)}
              className="bg-black/60 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 flex flex-col items-center gap-1 h-auto p-2 min-w-[48px] rounded-lg transition-all"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">{t('mobile.profile')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 