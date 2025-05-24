
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ScanResultItem } from '@/lib/types';
import { AlertTriangle, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';

interface ScanHistoryListProps {
  historyItems: ScanResultItem[];
  onViewItem: (item: ScanResultItem) => void;
  onDeleteItem: (itemId: string) => void;
  onClearHistory: () => void;
}

export function ScanHistoryList({ historyItems, onViewItem, onDeleteItem, onClearHistory }: ScanHistoryListProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  const formatTimestampShort = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateString = new Intl.DateTimeFormat(currentLocale, { dateStyle: 'short' }).format(date);
    const timeString = new Intl.DateTimeFormat(currentLocale, { timeStyle: 'short' }).format(date);
    return t('history.scannedOn', { date: dateString, time: timeString });
  };


  if (historyItems.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{t('history.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('history.noHistory')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold">{t('history.title')}</CardTitle>
          <CardDescription>{t('history.description')}</CardDescription>
        </div>
        {historyItems.length > 0 && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" /> {t('clearAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('history.confirmClearAllTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('history.confirmClearAllDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={onClearHistory}>{t('history.clearHistoryButton')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="overflow-auto h-[60vh] pr-4">
          <ul className="space-y-4">
            {historyItems.map(item => (
              <li key={item.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-md overflow-hidden border">
                    <Image
                      src={item.imageDataUrl}
                      alt={t('history.scannedFoodAlt') || "Scanned food item"}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="food item"
                    />
                  </div>
                  <div className="flex-grow min-w-0"> {/* min-w-0 helps flex truncation */}
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatTimestampShort(item.timestamp)}
                    </p>
                    <h3 className="font-semibold mb-1">{t('history.identifiedAllergens')}</h3>
                    
                    {/* Mobile Allergen Summary */}
                    <div className="sm:hidden mt-1">
                      {item.identifiedAllergens.length > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t('history.allergensFoundCount', { count: item.identifiedAllergens.length })}
                          {item.userProfileAllergiesAtScanTime.some(ua => 
                            item.identifiedAllergens.some(ia => ia.allergen.toLowerCase() === ua.toLowerCase())
                          ) &&
                            <span className="ml-1 text-destructive font-semibold">{t('history.includesYourAllergy')}</span>
                          }
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('history.noAllergensInScan')}</p>
                      )}
                    </div>

                    {/* Desktop Allergen Badges */}
                    {item.identifiedAllergens.length > 0 ? (
                      <div className="hidden sm:flex flex-wrap gap-1.5 mt-1">
                        {item.identifiedAllergens.slice(0, 4).map(allergen => (
                          <Badge
                            key={allergen.allergen}
                            variant={item.userProfileAllergiesAtScanTime.includes(allergen.allergen.toLowerCase()) ? "destructive" : "secondary"}
                            className="capitalize text-xs px-2 py-0.5" // Slightly smaller badges
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {allergen.allergen} ({Math.round(allergen.confidence * 100)}%)
                          </Badge>
                        ))}
                        {item.identifiedAllergens.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">{t('history.moreItems', { count: item.identifiedAllergens.length - 4 })}</Badge>
                        )}
                      </div>
                    ) : (
                      <p className="hidden sm:block text-sm text-muted-foreground mt-1">{t('history.noAllergensInScan')}</p>
                    )}
                  </div>
                   <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 shrink-0 mt-4 sm:mt-0 sm:ml-auto">
                      <Button variant="outline" size="sm" onClick={() => onViewItem(item)} className="w-full sm:w-auto justify-center">
                        <Eye className="h-4 w-4 mr-2" /> {t('view')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="sm" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive justify-center">
                            <Trash2 className="h-4 w-4 mr-2" /> {t('delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('history.confirmDeleteItemTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('history.confirmDeleteItemDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteItem(item.id)}>{t('delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

