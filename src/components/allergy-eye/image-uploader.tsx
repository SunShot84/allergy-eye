"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { UploadCloud, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (file: File, dataUrl: string) => void;
  isLoading: boolean;
}

export function ImageUploader({ onImageUpload, isLoading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (e.g., JPG, PNG, WEBP).",
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
  }, [onImageUpload, toast]);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
    // Optionally, call a prop to clear results in parent component
    // onImageRemove?.(); 
  }, []);

  const handleCardClick = () => {
    if (!isLoading && !preview && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      className="w-full max-w-lg mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={handleCardClick}
      role="button"
      aria-label="Upload food image"
      tabIndex={preview ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">Upload Food Image</CardTitle>
        <CardDescription className="text-center">
          Take a picture or select an image of a food item to identify potential allergens.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <div className="relative w-full h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 transition-colors hover:border-primary cursor-pointer">
          {isLoading ? (
            <div className="flex flex-col items-center text-primary">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="mt-2 text-sm font-medium">Analyzing Image...</p>
            </div>
          ) : preview ? (
            <>
              <Image src={preview} alt="Food preview" layout="fill" objectFit="contain" className="rounded-md p-1" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                aria-label="Remove image"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground pointer-events-none">
              <UploadCloud className="h-12 w-12" />
              <p className="mt-2 text-sm font-medium">Click or drag & drop to upload</p>
              <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isLoading || !!preview} // Disable if loading or preview exists
            aria-hidden="true" 
          />
        </div>
        {fileName && !isLoading && (
          <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
        )}
      </CardContent>
    </Card>
  );
}
