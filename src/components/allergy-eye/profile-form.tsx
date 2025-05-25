"use client";

import React, { useState, useEffect, useId, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Upload, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { analyzeAllergyReportImage } from '@/app/[locale]/actions';
import { getAllAllergens, getAllergenById, findAllergenIdsByKeyword, Allergen, AllergenName } from '@/lib/allergens';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  knownAllergies: string[];
}

interface ProfileFormProps {
}

const getAllergenDisplayName = (allergen: Allergen, locale: string): string => {
  const langKey = locale.toLowerCase();
  if (langKey === 'zh-cn' && allergen.name.sc?.length > 0) return allergen.name.sc[0];
  if (langKey === 'zh-tw' && allergen.name.tc?.length > 0) return allergen.name.tc[0];
  if (allergen.name.eng?.length > 0) return allergen.name.eng[0];
  return allergen.id;
};

export function ProfileForm({}: ProfileFormProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile>({ knownAllergies: [] });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isImportingReport, setIsImportingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allAvailableAllergens: Allergen[] = useMemo(() => getAllAllergens(), []);

  const fuse = useMemo(() => {
    const options = {
      keys: ['name.sc', 'name.tc', 'name.eng'],
      includeScore: true,
      threshold: 0.4,
    };
    return new Fuse(allAvailableAllergens, options);
  }, [allAvailableAllergens]);

  const filteredAvailableAllergens = useMemo(() => {
    if (!searchTerm.trim()) {
      return allAvailableAllergens;
    }
    return fuse.search(searchTerm.trim()).map(result => result.item);
  }, [searchTerm, allAvailableAllergens, fuse]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        setProfileError(error.message || 'Could not load your profile.');
        toast({ variant: 'destructive', title: t('error.generalTitle'), description: error.message || 'Could not load your profile.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token, isAuthenticated, t, toast]);

  const saveProfileToServer = useCallback(async (updatedProfile: UserProfile) => {
    setIsSavingProfile(true);
    if (!isAuthenticated || !token) {
      setIsSavingProfile(false);
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: t('error.authRequired') });
      return;
    }
    setProfileError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save profile' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setProfileError(error.message || 'Could not save your profile.');
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: error.message || t('error.saveProfileFailed') });
    } finally {
      setIsSavingProfile(false);
    }
  }, [token, isAuthenticated, t, toast]);

  const handleToggleAllergy = (allergenId: string) => {
    const isCurrentlySelected = profile.knownAllergies.includes(allergenId);
    const newKnownAllergies = isCurrentlySelected
      ? profile.knownAllergies.filter((id) => id !== allergenId)
      : [...profile.knownAllergies, allergenId];
    
    const updatedProfile = { ...profile, knownAllergies: newKnownAllergies };
    setProfile(updatedProfile);
    saveProfileToServer(updatedProfile);
  };

  const handleRemoveAllergy = (allergyIdToRemove: string) => {
    const updatedAllergies = profile.knownAllergies.filter((id: string) => id !== allergyIdToRemove);
    const updatedProfile = { ...profile, knownAllergies: updatedAllergies };
    setProfile(updatedProfile);
    saveProfileToServer(updatedProfile);
  };

  const handleReportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReportFile(event.target.files[0]);
    }
  };

  const handleImportFromReport = async () => {
    if (!reportFile) return;
    setIsImportingReport(true);

    const reader = new FileReader();
    reader.readAsDataURL(reportFile);
    reader.onload = async () => {
      const base64DataUri = reader.result as string;
      try {
        const extractedAllergenNames = await analyzeAllergyReportImage(base64DataUri, currentLocale as 'en' | 'zh-CN' | 'zh-TW');
        
        let addedCount = 0;
        const newKnownAllergiesFromReport: string[] = [...profile.knownAllergies];
        const newlyAddedDisplayNames: string[] = [];

        for (const name of extractedAllergenNames) {
          let foundIds = findAllergenIdsByKeyword(name, currentLocale as keyof AllergenName);
          if (foundIds.length === 0) {
            foundIds = findAllergenIdsByKeyword(name);
          }

          for (const id of foundIds) {
            if (id && !newKnownAllergiesFromReport.includes(id)) {
              newKnownAllergiesFromReport.push(id);
              const allergenInfo = getAllergenById(id);
              if(allergenInfo) newlyAddedDisplayNames.push(getAllergenDisplayName(allergenInfo, currentLocale));
              addedCount++;
            }
          }
        }
        
        if (addedCount > 0) {
          const updatedProfile = { ...profile, knownAllergies: newKnownAllergiesFromReport };
          setProfile(updatedProfile);
          await saveProfileToServer(updatedProfile);
          
          toast({
            title: t('profile.reportImportSuccessTitle'),
            description: t('profile.reportImportSuccessDescWithCount', { count: addedCount, allergenNames: newlyAddedDisplayNames.join(', ') }),
          });
        } else if (extractedAllergenNames.length > 0) {
          toast({
            title: t('profile.reportImportNoNewAllergensTitle'),
            description: t('profile.reportImportNoNewAllergensDesc'),
          });
        } else {
            toast({
            title: t('profile.reportImportNoAllergensFoundTitle'),
            description: t('profile.reportImportNoAllergensFoundDesc'),
          });
        }
      } catch (error) {
        console.error("Error importing from report:", error);
        toast({
          variant: "destructive",
          title: t('profile.reportImportErrorTitle'),
          description: t('profile.reportImportErrorDesc'),
        });
      }
      setReportFile(null); 
      const fileInput = document.getElementById('report-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setIsImportingReport(false);
    };
    reader.onerror = (error) => {
      console.error("Error reading file for report import:", error);
      toast({
        variant: "destructive",
        title: t('profile.reportImportErrorTitle'),
        description: t('profile.reportImportErrorDesc'), 
      });
      setIsImportingReport(false);
    };
  };
  
  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('profile.loadingProfile')}</p>
      </div>
    );
  }

  if (profileError && !isLoadingProfile) {
    return (
      <Card className="w-full max-w-xl mx-auto shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            {t('error.generalTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{profileError}</p>
          <Button onClick={() => {
            if (token && isAuthenticated) {
              window.location.reload();
            }
          }} className="mt-4">
            {t('error.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t('profile.title')}</CardTitle>
        <CardDescription>
          {t('profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`mb-6 transition-opacity duration-300 ${isSavingProfile ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-medium mb-2">{t('profile.selectYourAllergensTitle')}</h3>
          
          <div className="mb-4">
            <Input
              type="text"
              placeholder={t('profile.searchAllergenPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <ScrollArea className="h-60 w-full rounded-md border p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredAvailableAllergens.map((allergen, index) => {
                const displayName = getAllergenDisplayName(allergen, currentLocale);
                const isSelected = profile.knownAllergies.includes(allergen.id);
                return (
                  <TooltipProvider key={`available-allergen-item-${allergen.id}-${index}`} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isSelected ? "secondary" : "outline"}
                          onClick={() => handleToggleAllergy(allergen.id)}
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          aria-pressed={isSelected}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-4 w-4 mr-2 shrink-0 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate">{displayName}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{displayName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {profile.knownAllergies.length > 0 && (
          <div className={`mb-6 pt-4 border-t transition-opacity duration-300 ${isSavingProfile ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-medium mb-2">{t('profile.yourSelectedAllergensTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {profile.knownAllergies.map((id, index) => {
                const allergenInfo = getAllergenById(id);
                const displayName = allergenInfo ? getAllergenDisplayName(allergenInfo, currentLocale) : id;
                return (
                  <Badge key={`selected-allergen-item-${id}-${index}`} variant="secondary" className="text-sm py-1 px-2">
                    {displayName}
                    <button
                      onClick={() => handleRemoveAllergy(id)}
                      className="ml-1.5 text-muted-foreground hover:text-destructive"
                      aria-label={t('profile.removeAllergenAriaLabel')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="space-y-3 pt-6 border-t">
          <h3 className="text-lg font-medium">{t('profile.importFromReportButton')}</h3>
           <p className="text-sm text-muted-foreground">{t('profile.description')}</p>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              id="report-file-input"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleReportFileChange}
              className="sr-only"
              disabled={isImportingReport}
            />
            <label
              htmlFor="report-file-input"
              className={`inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full sm:w-auto cursor-pointer ${
                isImportingReport 
                  ? 'bg-muted text-muted-foreground pointer-events-none' 
                  : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {isImportingReport ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                 <Upload className="mr-2 h-4 w-4" />
              )}
              {isImportingReport ? t('profile.processingButton') : t('profile.chooseReportImageLabel')}
            </label>
            
            {reportFile && !isImportingReport && (
              <Button
                type="button"
                onClick={handleImportFromReport}
                disabled={isImportingReport}
                className="w-full sm:w-auto"
              >
                 <Upload className="h-4 w-4 mr-2" />
                {t('profile.importFromReportButton')}
              </Button>
            )}
            </div>
            {reportFile && (
              <div className="mt-2 flex items-center justify-between grow bg-muted/50 p-2 rounded-md text-sm">
                <span className="truncate text-muted-foreground max-w-[200px] sm:max-w-xs">
                  {reportFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setReportFile(null);
                    const fileInput = document.getElementById('report-file-input') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  disabled={isImportingReport}
                  aria-label={t('clearAll')}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
