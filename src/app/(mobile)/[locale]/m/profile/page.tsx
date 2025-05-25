"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  LogIn,
  Shield,
  Globe,
  Monitor
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useAuth } from '@/contexts/AuthContext';
import { getAllergenById } from '@/lib/allergens';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Helper function to get allergen display name based on locale
const getAllergenDisplayName = (allergenId: string, locale: string): string => {
  const allergen = getAllergenById(allergenId);
  if (!allergen) return allergenId;
  
  const langKey = locale.toLowerCase();
  if (langKey === 'zh-cn' && allergen.name.sc?.length > 0) return allergen.name.sc[0];
  if (langKey === 'zh-tw' && allergen.name.tc?.length > 0) return allergen.name.tc[0];
  if (allergen.name.eng?.length > 0) return allergen.name.eng[0];
  return allergen.id;
};

export default function MobileProfilePage() {
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${currentLocale}/m`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const knownAllergies = user?.profile?.knownAllergies || [];

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 py-12">
        {/* 未登录状态 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('mobile.welcomeToAllergenDetection')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('mobile.loginBenefits')}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/${currentLocale}/login?redirect=${encodeURIComponent(`/${currentLocale}/m/profile`)}`)}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {t('mobile.loginNow')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(`/${currentLocale}/register?redirect=${encodeURIComponent(`/${currentLocale}/m/profile`)}`)}
                className="w-full"
              >
                {t('mobile.registerAccount')}
              </Button>
            </div>
          </div>
        </div>

        {/* 底部快捷操作 */}
        <div className="p-4 space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}`)}
                  className="w-full justify-start"
                >
                  <Monitor className="h-4 w-4 mr-3" />
                  {t('mobile.switchToDesktop')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}/settings`)}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  {t('settings.title')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 mb-24">

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 用户信息卡片 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user?.username || t('mobile.user')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('mobile.userId')}: {user?.id || t('mobile.unknown')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 过敏原信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('mobile.myAllergens')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {knownAllergies.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {knownAllergies.map((allergenId) => {
                    const displayName = getAllergenDisplayName(allergenId, currentLocale);
                    return (
                      <Badge key={allergenId} variant="destructive" className="text-sm">
                        {displayName}
                      </Badge>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${currentLocale}/profile`)}
                  className="w-full"
                >
                  {t('mobile.editAllergenSettings')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">
                  {t('mobile.noAllergenInfo')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${currentLocale}/profile`)}
                >
                  {t('mobile.setupNow')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能菜单 */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}/m/history`)}
                  className="w-full justify-start h-14 px-4 rounded-none"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{t('mobile.scanHistory')}</div>
                    <div className="text-xs text-muted-foreground">{t('mobile.viewHistoryDesc')}</div>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}/profile`)}
                  className="w-full justify-start h-14 px-4 rounded-none"
                >
                  <User className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{t('mobile.personalProfile')}</div>
                    <div className="text-xs text-muted-foreground">{t('mobile.manageAllergenAndAccount')}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}/settings`)}
                  className="w-full justify-start h-14 px-4 rounded-none"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{t('mobile.appSettings')}</div>
                    <div className="text-xs text-muted-foreground">{t('mobile.privacyNotificationSettings')}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${currentLocale}`)}
                  className="w-full justify-start h-14 px-4 rounded-none"
                >
                  <Monitor className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{t('mobile.desktopVersion')}</div>
                    <div className="text-xs text-muted-foreground">{t('mobile.switchToDesktopDesc')}</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 退出登录 */}
          <Card>
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start h-14 px-4 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{t('mobile.logout')}</div>
                  <div className="text-xs opacity-75">{t('mobile.logoutDesc')}</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 