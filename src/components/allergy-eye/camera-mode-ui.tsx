
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, RefreshCw, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';

interface CameraModeUIProps {
  onPhotoCaptured: (dataUrl: string) => void;
  isLoading: boolean;
}

export function CameraModeUI({ onPhotoCaptured, isLoading }: CameraModeUIProps) {
  const t = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('home.cameraPermissionDeniedTitle'),
          description: "Your browser does not support camera access.",
        });
        return;
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(mediaStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('home.cameraPermissionDeniedTitle'),
          description: t('home.cameraPermissionDeniedDesc'),
        });
      }
    };

    if (!capturedImage) { // Only request permission if not showing a preview
      getCameraPermission();
    }

    return () => {
      cleanupStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]); // Re-request permission if retaking photo

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        cleanupStream(); // Stop camera stream after capture
      }
    }
  }, [cleanupStream]);

  const handleRetake = () => {
    setCapturedImage(null);
    // Camera permission will be re-requested by useEffect
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
    }
  };

  if (hasCameraPermission === null && !capturedImage) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>{t('home.cameraModeLabel')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-sm font-medium">{t('home.cameraInitializing')}</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">{capturedImage ? t('home.imagePreview') : t('home.cameraModeLabel')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <div className="relative w-full aspect-[4/3] border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
          {isLoading && !capturedImage && ( // Show loader overlay only during active analysis on camera view
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
              <p className="mt-2 text-sm font-medium text-white">{t('home.analyzing')}</p>
            </div>
          )}
          {capturedImage ? (
            <Image src={capturedImage} alt={t('home.imagePreview')} layout="fill" objectFit="contain" data-ai-hint="food photo" />
          ) : hasCameraPermission ? (
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
              <Camera className="h-12 w-12 mb-2" />
              <p className="font-medium">{t('home.noCameraDetected')}</p>
              <p className="text-xs">{t('home.cameraPermissionDeniedDesc')}</p>
            </div>
          )}
        </div>

        {!hasCameraPermission && !capturedImage && (
             <Alert variant="destructive" className="w-full">
              <AlertTitle>{t('home.cameraAccessRequired')}</AlertTitle>
              <AlertDescription>
                {t('home.cameraAccessRequiredDesc')}
              </AlertDescription>
            </Alert>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {isLoading && capturedImage && ( // Show loader specifically when a captured image is being analyzed
           <div className="flex flex-col items-center text-primary">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-2 text-sm font-medium">{t('home.analyzing')}</p>
            </div>
        )}


        {!isLoading && (
          <div className="flex w-full gap-2">
            {capturedImage ? (
              <>
                <Button onClick={handleRetake} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" /> {t('home.retakePhotoButton')}
                </Button>
                <Button onClick={handleUsePhoto} className="flex-1">
                  <Check className="mr-2 h-4 w-4" /> {t('home.useThisPhotoButton')}
                </Button>
              </>
            ) : (
              <Button onClick={handleCapture} disabled={!hasCameraPermission || isLoading} className="w-full">
                <Camera className="mr-2 h-5 w-5" /> {t('home.captureButton')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
