"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, FlipHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/client';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose?: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 停止之前的流
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('无法访问摄像头，请检查权限设置');
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    startCamera();
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到画布
    ctx.drawImage(video, 0, 0);

    // 转换为base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(imageData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">摄像头访问失败</h3>
          <p className="text-sm opacity-75 mb-4">{error}</p>
          <Button onClick={startCamera} variant="outline">
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black overflow-hidden flex items-center justify-center">
      {/* 视频预览容器 */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="max-w-full max-h-full object-contain"
          style={{ 
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            aspectRatio: 'auto'
          }}
        />
      </div>
      
      {/* 隐藏的画布用于截图 */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>启动摄像头中...</p>
          </div>
        </div>
      )}

      {/* 顶部控制栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCamera}
          className="text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <FlipHorizontal className="h-6 w-6" />
        </Button>
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 mb-16 z-20">
        <div className="flex items-center justify-center space-x-8">
          {/* 相册选择 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:bg-white/20 w-12 h-12 backdrop-blur-sm"
          >
            <ImageIcon className="h-6 w-6" />
          </Button>

          {/* 拍照按钮 */}
          <Button
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black border-4 border-white shadow-lg transition-transform hover:scale-105"
            disabled={isLoading}
          >
            <Camera className="size-6" />
          </Button>

          {/* 占位符保持对称 */}
          <div className="w-12 h-12" />
        </div>
      </div>

      {/* 扫描框引导 - 调整位置以适应不同屏幕比例 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
          {/* 四个角的装饰 */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
          
          {/* 扫描动画线 */}
          <div className="absolute inset-2 overflow-hidden rounded">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-75"></div>
          </div>
        </div>
      </div>

      {/* 边角暗化效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
      </div>
    </div>
  );
} 