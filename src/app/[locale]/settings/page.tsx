
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useLocalStorage from '@/hooks/use-local-storage';
import { DEV_PREFERRED_MODE_STORAGE_KEY, type DevPreferredMode } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/client';
import { useToast } from '@/hooks/use-toast';
import { Cog } from 'lucide-react';

const SettingsPage_INITIAL_DEV_MODE: DevPreferredMode = 'automatic';

export default function SettingsPage() {
  const t = useI18n();
  const { toast } = useToast();
  const [devPreferredMode, setDevPreferredMode] = useLocalStorage<DevPreferredMode>(
    DEV_PREFERRED_MODE_STORAGE_KEY,
    SettingsPage_INITIAL_DEV_MODE
  );

  const handleModeChange = (value: string) => {
    const newMode = value as DevPreferredMode;
    setDevPreferredMode(newMode);
    toast({
      title: t('settings.settingsSaved'),
      description: t('settings.settingsSavedDesc'),
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Cog className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold">{t('settings.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              {t('settings.operatingModeTitle')}
            </h3>
            <RadioGroup
              value={devPreferredMode}
              onValueChange={handleModeChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="automatic" id="mode-auto" />
                <Label htmlFor="mode-auto" className="flex-1 cursor-pointer py-1">
                  {t('settings.modeAutomatic')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="force_camera" id="mode-force-camera" />
                <Label htmlFor="mode-force-camera" className="flex-1 cursor-pointer py-1">
                  {t('settings.modeForceCamera')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="force_upload" id="mode-force-upload" />
                <Label htmlFor="mode-force-upload" className="flex-1 cursor-pointer py-1">
                  {t('settings.modeForceUpload')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
