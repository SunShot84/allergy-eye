
"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AllergenAnalysisResult } from '@/app/[locale]/actions';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n/client';

interface AllergenResultsProps {
  analysisResult: AllergenAnalysisResult | null;
  userProfileAllergies: string[];
}

export function AllergenResults({ analysisResult, userProfileAllergies }: AllergenResultsProps) {
  const t = useI18n();

  useEffect(() => {
    // The fadeIn animation is now handled by tailwind.config.ts and globals.css
    // No client-side style injection needed here.
  }, []);
  
  if (!analysisResult) {
    return null;
  }

  const { identifiedAllergens, prioritizedAllergens } = analysisResult;

  if (identifiedAllergens.length === 0) {
    return (
      <Card className="mt-6 shadow-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {t('allergenResults.noAllergensDetected')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('allergenResults.noAllergensInfo')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedAllergens = [...identifiedAllergens].sort((a, b) => {
    const aIsPrioritized = prioritizedAllergens.includes(a.allergen);
    const bIsPrioritized = prioritizedAllergens.includes(b.allergen);

    if (aIsPrioritized && !bIsPrioritized) return -1;
    if (!aIsPrioritized && bIsPrioritized) return 1;
    return b.confidence - a.confidence;
  });

  return (
    <Card className="mt-6 shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t('allergenResults.title')}</CardTitle>
        <CardDescription>
          {t('allergenResults.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedAllergens.map(({ allergen, confidence }) => {
            const isUserAllergy = userProfileAllergies.includes(allergen.toLowerCase());
            const confidencePercentage = Math.round(confidence * 100);
            return (
              <li
                key={allergen}
                className={`p-4 rounded-lg border ${
                  isUserAllergy ? 'border-destructive bg-destructive/10' : 'border-border bg-card'
                } transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <AlertTriangle className={`h-5 w-5 ${isUserAllergy ? 'text-destructive' : 'text-amber-500'}`} />
                    <span className={`font-medium text-lg ${isUserAllergy ? 'text-destructive' : 'text-foreground'}`}>
                      {allergen}
                    </span>
                  </div>
                  {isUserAllergy && (
                    <Badge variant="destructive" className="text-xs">{t('allergenResults.yourAllergyBadge')}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('allergenResults.confidence', { percentage: confidencePercentage })}</span>
                </div>
                <Progress value={confidencePercentage} className={`h-2 mt-1 ${isUserAllergy ? '[&>div]:bg-destructive' : ''}`} />
                {confidence < 0.5 && !isUserAllergy && (
                   <p className="text-xs text-muted-foreground mt-1">{t('allergenResults.lowConfidenceInfo')}</p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
