"use client";

import React, { useState } from 'react';
import { CameraView } from '@/components/mobile/camera-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

type ScanMode = 'food' | 'ingredients';

export default function MobilePage() {
  const [scanMode, setScanMode] = useState<ScanMode>('food');
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  const handleCapture = async (imageData: string) => {
    console.log('Captured image:', imageData.substring(0, 50) + '...');
    
    // TODO: 处理图片分析
    // 这里可以调用AI分析API
    
    // 跳转到结果页面
    router.push(`/${currentLocale}/m/result?mode=${scanMode}`);
  };

  return (
    <div className="h-screen overflow-hidden flex-1 relative">
      {/* 摄像头视图 */}
      <CameraView onCapture={handleCapture} />
      
      {/* 底部tab */}
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
            onClick={() => setScanMode('food')}
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
            onClick={() => setScanMode('ingredients')}
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
      
      {/* 顶部模式指示器 */}
      <div className="absolute top-16 left-0 right-0 px-4">
        <div className="flex justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <p className="text-white text-sm">
              {scanMode === 'food' ? '🍎 食品扫描模式' : '📋 配料表扫描模式'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 