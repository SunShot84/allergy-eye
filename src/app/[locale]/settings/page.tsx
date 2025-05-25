"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useLocalStorage from '@/hooks/use-local-storage';
import { DEV_PREFERRED_MODE_STORAGE_KEY, type DevPreferredMode } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/client';
import { useToast } from '@/hooks/use-toast';
import { Cog, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getIpLocation, getCachedLocation, cacheLocation, formatLocationDescription, type IpLocation } from '@/lib/services/geo-location';

const SettingsPage_INITIAL_DEV_MODE: DevPreferredMode = 'automatic';

interface PrivacySettings {
  allowIpAddress: boolean;
  allowGeolocation: boolean;
  enablePredictiveLearning: boolean;
}

export default function SettingsPage() {
  const t = useI18n();
  const { toast } = useToast();
  const [devPreferredMode, setDevPreferredMode] = useLocalStorage<DevPreferredMode>(
    DEV_PREFERRED_MODE_STORAGE_KEY,
    SettingsPage_INITIAL_DEV_MODE
  );
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    allowIpAddress: false,
    allowGeolocation: false,
    enablePredictiveLearning: false,
  });
  const [ipLocation, setIpLocation] = useState<IpLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('privacySettings');
    if (savedSettings) {
      setPrivacySettings(JSON.parse(savedSettings));
    }

    // 加载缓存的位置信息
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      setIpLocation(cachedLocation);
    }
  }, []);

  // 当IP地址设置改变时更新位置信息
  useEffect(() => {
    if (privacySettings.allowIpAddress) {
      refreshLocation();
    } else {
      setIpLocation(null);
    }
  }, [privacySettings.allowIpAddress]);

  const refreshLocation = async () => {
    if (!privacySettings.allowIpAddress) {
      toast({
        title: t('settings.ipAddressDisabled'),
        description: t('settings.enableIpAddressFirst'),
        variant: "destructive"
      });
      return;
    }

    setIsLoadingLocation(true);
    try {
      const location = await getIpLocation();
      if (location) {
        setIpLocation(location);
        cacheLocation(location);
        toast({
          title: t('settings.locationUpdated'),
          description: formatLocationDescription(location),
        });
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      toast({
        title: t('settings.locationUpdateFailed'),
        description: t('settings.tryAgainLater'),
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleModeChange = (value: string) => {
    const newMode = value as DevPreferredMode;
    setDevPreferredMode(newMode);
    toast({
      title: t('settings.settingsSaved'),
      description: t('settings.settingsSavedDesc'),
    });
  };

  // 保存设置到本地存储
  const saveSettings = (newSettings: Partial<PrivacySettings>) => {
    const updatedSettings = { ...privacySettings, ...newSettings };
    setPrivacySettings(updatedSettings);
    localStorage.setItem('privacySettings', JSON.stringify(updatedSettings));
    toast({
      title: t('settings.settingsSaved'),
      description: t('settings.settingsSavedDesc'),
    });
  };

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      <Separator />

      {/* 操作模式设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.operatingModeTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* 隐私权设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.privacyTitle')}</CardTitle>
          <CardDescription>{t('settings.privacyDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="allowIpAddress">{t('settings.allowIpAddress')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.allowIpAddressDescription')}
              </p>
              {privacySettings.allowIpAddress && ipLocation && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">{t('settings.currentLocation')}:</p>
                  <p className="text-muted-foreground">{formatLocationDescription(ipLocation)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={refreshLocation}
                    disabled={isLoadingLocation}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                    {t('settings.refreshLocation')}
                  </Button>
                </div>
              )}
            </div>
            <Switch
              id="allowIpAddress"
              checked={privacySettings.allowIpAddress}
              onCheckedChange={(checked) => saveSettings({ allowIpAddress: checked })}
            />
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            {t('settings.privacyNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
