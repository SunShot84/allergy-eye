
"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UploadCloud, Camera } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

interface ModeToggleSwitchProps {
  currentMode: 'upload' | 'camera';
  onModeChange: (mode: 'upload' | 'camera') => void;
  disabled?: boolean;
}

export function ModeToggleSwitch({ currentMode, onModeChange, disabled }: ModeToggleSwitchProps) {
  const t = useI18n();
  const isCameraMode = currentMode === 'camera';

  const handleToggle = (checked: boolean) => {
    onModeChange(checked ? 'camera' : 'upload');
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-card border rounded-lg shadow-sm justify-center">
      <div className="flex flex-col items-center space-y-1">
        <UploadCloud className={`h-5 w-5 ${!isCameraMode ? 'text-primary' : 'text-muted-foreground'}`} />
        <Label htmlFor="mode-switch" className={`text-xs ${!isCameraMode ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          {t('home.uploadModeLabel')}
        </Label>
      </div>
      <Switch
        id="mode-switch"
        checked={isCameraMode}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={isCameraMode ? t('home.switchToUploadMode') : t('home.switchToCameraMode')}
      />
      <div className="flex flex-col items-center space-y-1">
        <Camera className={`h-5 w-5 ${isCameraMode ? 'text-primary' : 'text-muted-foreground'}`} />
        <Label htmlFor="mode-switch" className={`text-xs ${isCameraMode ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          {t('home.cameraModeLabel')}
        </Label>
      </div>
    </div>
  );
}
