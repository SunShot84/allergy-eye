"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { CameraView } from '@/components/mobile/camera-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, List, Loader2 } from 'lucide-react';
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
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">
              {scanMode === 'food' ? '正在分析食品...' : '正在分析配料表...'}
            </p>
            <p className="text-sm opacity-75 mt-2">
              请稍等，这可能需要几秒钟
            </p>
          </div>
        </div>
      )}

      {/* 分析结果遮罩 */}
      {analysisResult && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-40 overflow-y-auto">
          <div className="flex-1 p-4 pt-20">
            <div className="max-w-lg mx-auto">
              {/* 关闭按钮 */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">分析结果</h2>
                <Button
                  variant="ghost"
                  onClick={() => setAnalysisResult(null)}
                  className="text-white hover:bg-white/20"
                >
                  关闭
                </Button>
              </div>

              {/* 结果组件 */}
              <div className="bg-white rounded-lg overflow-hidden">
                <AllergenResults 
                  analysisResult={analysisResult}
                  userProfile={{ knownAllergies: knownAllergies }}
                />
              </div>

              {/* 重新扫描按钮 */}
              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => setAnalysisResult(null)}
                  className="flex-1"
                  variant="outline"
                >
                  重新扫描
                </Button>
                <Button
                  onClick={() => router.push(`/${currentLocale}/m/history`)}
                  className="flex-1"
                >
                  查看历史
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部tab - 只在没有结果时显示 */}
      {!analysisResult && (
        <div className="absolute bottom-3 left-0 right-0 px-4">
          {/* 模式说明 */}
          <div className="text-center mb-1">
            <p className="text-white text-xs opacity-75">
              {scanMode === 'food' ? '识别整个食品包装，获取基本信息' : '识别配料表文字，详细分析成分'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 scale-75">
            <Button
              variant={scanMode === 'food' ? 'default' : 'secondary'}
              onClick={() => handleModeChange('food')}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 text-lg rounded-full ${
                scanMode === 'food' 
                  ? 'bg-white text-black shadow-lg font-bold active:bg-white hover:bg-white' 
                  : 'bg-black/50 text-white border border-white/30'
              }`}
            >
              <Utensils className="size-5" />
              <span>扫食品</span>
              {scanMode === 'food' && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  默认
                </Badge>
              )}
            </Button>
            
            <Button
              variant={scanMode === 'ingredients' ? 'default' : 'secondary'}
              onClick={() => handleModeChange('ingredients')}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 text-lg rounded-full ${
                scanMode === 'ingredients' 
                  ? 'bg-white text-black shadow-lg font-bold active:bg-white hover:bg-white' 
                  : 'bg-black/50 text-white border border-white/30'
              }`}
            >
              <List className="size-5" />
              <span>扫配料表</span>
              {scanMode === 'ingredients' && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  活跃
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* 顶部模式指示器 - 只在没有结果时显示 */}
      {!analysisResult && (
        <div className="absolute top-16 left-0 right-0 px-4">
          <div className="flex justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <p className="text-white text-sm">
                {scanMode === 'food' ? '🍎 食品扫描模式' : '📋 配料表扫描模式'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 