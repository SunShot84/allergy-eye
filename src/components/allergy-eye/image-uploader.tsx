
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { UploadCloud, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';

interface ImageUploaderProps {
  onImageUpload: (file: File, dataUrl: string) => void;
  isLoading: boolean;
  uploaderTitle: string;
  uploaderDescription: string;
  imageAltText?: string;
}

export function ImageUploader({ 
  onImageUpload, 
  isLoading,
  uploaderTitle,
  uploaderDescription,
  imageAltText = "Uploaded image preview" 
}: ImageUploaderProps) {
  const t = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('home.fileTooLarge'),
          description: t('home.fileTooLargeDesc'),
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('home.invalidFileType'),
          description: t('home.invalidFileTypeDesc'),
          variant: "destructive",
        });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onImageUpload(file, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast, t]);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCardClick = () => {
    if (!isLoading && !preview && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset preview when isLoading becomes false (analysis finished or cancelled)
  // and there is no analysisResult (meaning it might have failed or was for a different mode)
  // This specific logic might be better handled in the parent component (HomePage)
  // by explicitly calling handleRemoveImage or passing a reset prop.
  // For now, this component only clears its own preview state.

  return (
    <Card
      className="w-full max-w-lg mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={handleCardClick}
      role="button"
      aria-label={uploaderTitle}
      tabIndex={preview ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">{uploaderTitle}</CardTitle>
        <CardDescription className="text-center">
          {uploaderDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <div className="relative w-full h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 transition-colors hover:border-primary cursor-pointer">
          {isLoading ? (
            <div className="flex flex-col items-center text-primary">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="mt-2 text-sm font-medium">{t('home.analyzing')}</p>
            </div>
          ) : preview ? (
            <>
              <Image src={preview} alt={imageAltText} layout="fill" objectFit="contain" className="rounded-md p-1" data-ai-hint="ingredient list preview" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                aria-label={t('home.removeImage')}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground pointer-events-none">
              <UploadCloud className="h-12 w-12" />
              <p className="mt-2 text-sm font-medium">{t('home.clickOrDrag')}</p>
              <p className="text-xs">{t('home.fileTypes')}</p>
            </div>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()} 
            disabled={isLoading || !!preview}
            aria-hidden="true"
          />
        </div>
        {fileName && !isLoading && (
          <p className="text-sm text-muted-foreground">{t('home.selectedFile', { fileName })}</p>
        )}
      </CardContent>
    </Card>
  );
}
