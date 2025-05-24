
"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, FileText } from 'lucide-react';
import type { AllergenAnalysisResult } from '@/app/[locale]/actions';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AllergenResultsProps {
  analysisResult: AllergenAnalysisResult | null;
  userProfileAllergies: string[];
}

export function AllergenResults({ analysisResult, userProfileAllergies }: AllergenResultsProps) {
  const t = useI18n();

  useEffect(() => {
    // fadeIn animation handled by tailwind
  }, []);
  
  if (!analysisResult) {
    return null;
  }

  const { identifiedAllergens, prioritizedAllergens, extractedText } = analysisResult;

  if (identifiedAllergens.length === 0 && !extractedText) {
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
  
  if (identifiedAllergens.length === 0 && extractedText) {
     return (
      <Card className="mt-6 shadow-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {t('allergenResults.noAllergensDetected')}
          </CardTitle>
           <CardDescription>
            {t('allergenResults.noAllergensInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('allergenResults.extractedTextTitle')}
          </h3>
          <ScrollArea className="h-32 w-full rounded-md border p-3 bg-muted/20">
            <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }


  const sortedAllergens = [...identifiedAllergens].sort((a, b) => {
    const aIsPrioritized = prioritizedAllergens.includes(a.allergen.toLowerCase());
    const bIsPrioritized = prioritizedAllergens.includes(b.allergen.toLowerCase());

    if (aIsPrioritized && !bIsPrioritized) return -1;
    if (!aIsPrioritized && bIsPrioritized) return 1;
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return a.allergen.localeCompare(b.allergen);
  });

  return (
    <Card className="mt-6 shadow-lg animate-fadeIn w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t('allergenResults.title')}</CardTitle>
        <CardDescription>
          {t('allergenResults.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {extractedText && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('allergenResults.extractedTextTitle')}
            </h3>
            <ScrollArea className="h-32 w-full rounded-md border p-3 bg-muted/20">
              <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
            </ScrollArea>
          </div>
        )}
        <ul className="space-y-4">
          {sortedAllergens.map(({ allergen, confidence, sourceFoodItem }) => {
            const isUserAllergy = userProfileAllergies.includes(allergen.toLowerCase());
            const confidencePercentage = Math.round(confidence * 100);
            return (
              <li
                key={allergen + (sourceFoodItem || '')} 
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
                
                {sourceFoodItem ? (
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{t('allergenResults.sourceLabel', { source: sourceFoodItem })}</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {t('allergenResults.unknownSource')}
                  </p>
                )}

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
