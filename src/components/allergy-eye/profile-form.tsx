
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';

interface ProfileFormProps {
  initialAllergies: string[];
  onSave: (allergies: string[]) => void;
}

export function ProfileForm({ initialAllergies, onSave }: ProfileFormProps) {
  const t = useI18n();
  const [allergies, setAllergies] = useState<string[]>(initialAllergies);
  const [newAllergy, setNewAllergy] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setAllergies(initialAllergies);
  }, [initialAllergies]);

  const handleAddAllergy = useCallback(() => {
    const trimmedAllergy = newAllergy.trim();
    if (trimmedAllergy && !allergies.includes(trimmedAllergy.toLowerCase())) {
      setAllergies(prev => [...prev, trimmedAllergy.toLowerCase()]);
      setNewAllergy('');
    } else if (allergies.includes(trimmedAllergy.toLowerCase())) {
      toast({
        title: t('profile.allergyAlreadyAdded'),
        description: t('profile.allergyAlreadyAddedDesc', { allergy: trimmedAllergy }),
        variant: "default",
      });
    }
  }, [newAllergy, allergies, toast, t]);

  const handleRemoveAllergy = useCallback((allergyToRemove: string) => {
    setAllergies(prev => prev.filter(allergy => allergy !== allergyToRemove));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(allergies);
    toast({
      title: t('profile.profileSavedTitle'),
      description: t('profile.profileSavedDescription'),
    });
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t('profile.title')}</CardTitle>
        <CardDescription>
          {t('profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-allergy" className="block text-sm font-medium text-foreground">
              {t('profile.addAllergyLabel')}
            </label>
            <div className="flex gap-2">
              <Input
                id="new-allergy"
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder={t('profile.addAllergyPlaceholder')}
                className="flex-grow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <Button type="button" onClick={handleAddAllergy} variant="outline" className="shrink-0">
                <PlusCircle className="h-4 w-4 mr-2" /> {t('add')}
              </Button>
            </div>
          </div>

          {allergies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">{t('profile.currentAllergies')}</h3>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 min-h-[40px]">
                {allergies.map(allergy => (
                  <Badge
                    key={allergy}
                    variant="secondary"
                    className="text-sm py-1 px-3 capitalize bg-primary/10 text-primary-foreground border-primary/30"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="ml-2 rounded-full hover:bg-destructive/50 p-0.5"
                      aria-label={`${t('delete')} ${allergy}`}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {allergies.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('profile.noAllergiesYet')}</p>
          )}

          <Button type="submit" className="w-full">
            {t('profile.saveProfileButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
