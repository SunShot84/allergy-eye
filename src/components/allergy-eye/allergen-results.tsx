
"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AllergenAnalysisResult } from '@/app/actions';
import { Progress } from '@/components/ui/progress';

interface AllergenResultsProps {
  analysisResult: AllergenAnalysisResult | null;
  userProfileAllergies: string[];
}

export function AllergenResults({ analysisResult, userProfileAllergies }: AllergenResultsProps) {
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
            No Allergens Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our analysis did not find any common allergens in the uploaded image. However, always double-check ingredients if you have severe allergies.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort allergens: prioritized first, then by confidence descending
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
        <CardTitle className="text-2xl font-semibold">Allergen Analysis</CardTitle>
        <CardDescription>
          Potential allergens identified in the image. Allergens matching your profile are highlighted.
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
                    <Badge variant="destructive" className="text-xs">YOUR ALLERGY</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Confidence: {confidencePercentage}%</span>
                </div>
                <Progress value={confidencePercentage} className={`h-2 mt-1 ${isUserAllergy ? '[&>div]:bg-destructive' : ''}`} />
                {confidence < 0.5 && !isUserAllergy && (
                   <p className="text-xs text-muted-foreground mt-1">Low confidence. May not be present.</p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
