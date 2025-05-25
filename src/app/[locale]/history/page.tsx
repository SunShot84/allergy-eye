"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ScanHistoryList } from '@/components/allergy-eye/scan-history-list';
import type { ScanResultItem } from '@/lib/types';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function HistoryPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [scanHistory, setScanHistory] = useState<ScanResultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScanResultItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoadingHistory(false);
      return;
    }
    
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const response = await fetch('/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch scan history' }));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        const data: ScanResultItem[] = await response.json();
        setScanHistory(data);
      } catch (error: any) {
        console.error("Failed to fetch scan history:", error);
        setHistoryError(error.message || 'Could not load your scan history.');
        toast({ variant: 'destructive', title: t('error.generalTitle'), description: error.message || 'Could not load scan history.' });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [token, isAuthenticated, t, toast, closeModal]);

  const handleViewItem = (item: ScanResultItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (!isAuthenticated || !token) {
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: 'Authentication required.' });
      return;
    }
    const originalHistory = [...scanHistory];
    setScanHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
    if (selectedItem && selectedItem.id === itemId) closeModal();

    try {
      const response = await fetch(`/api/history/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete item' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      toast({ title: t('scanHistory.itemDeletedTitle'), description: t('scanHistory.itemDeletedDescription') });
    } catch (error: any) {
      console.error("Failed to delete scan history item:", error);
      setScanHistory(originalHistory);
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: error.message || 'Could not delete item.' });
    }
  }, [scanHistory, token, isAuthenticated, t, toast, selectedItem, closeModal]);

  const handleClearHistory = useCallback(async () => {
    if (!isAuthenticated || !token) {
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: 'Authentication required.' });
      return;
    }
    const originalHistory = [...scanHistory];
    setScanHistory([]);
    closeModal();

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to clear history' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      toast({ title: t('scanHistory.historyClearedTitle'), description: t('scanHistory.historyClearedDescription') });
    } catch (error: any) {
      console.error("Failed to clear scan history:", error);
      setScanHistory(originalHistory);
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: error.message || 'Could not clear history.' });
    }
  }, [token, isAuthenticated, t, toast, scanHistory, closeModal]);

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat(currentLocale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  if (isLoadingHistory && isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('scanHistory.loadingHistory')}</p>
      </div>
    );
  }

  if (historyError && isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-xl mx-auto shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t('error.generalTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{historyError}</p>
            <Button onClick={() => {
                if (isAuthenticated && token) {
                    window.location.reload();
                }
            }} className="mt-4">
              {t('error.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4">
        <ScanHistoryList
          historyItems={scanHistory}
          onViewItem={handleViewItem}
          onDeleteItem={handleDeleteItem}
          onClearHistory={handleClearHistory}
        />

        {selectedItem && (
          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) closeModal(); else setIsModalOpen(true); }}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl">{t('scanHistory.scanDetailsTitle')}</DialogTitle>
                <DialogDescription>
                  {t('scanHistory.scanDetailsDescription', { timestamp: formatTimestamp(selectedItem.timestamp) })}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-4 py-4">
                  <div className="relative w-full h-64 rounded-md overflow-hidden border">
                    <Image
                      src={selectedItem.imageDataUrl}
                      alt={t('scanHistory.scannedFoodAlt') || "Scanned food item"}
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="food item"
                    />
                  </div>
                  <AllergenResults
                    analysisResult={{
                      identifiedAllergens: selectedItem.identifiedAllergens,
                      prioritizedAllergens: selectedItem.prioritizedAllergens,
                      foodDescription: selectedItem.foodDescription,
                      extractedText: selectedItem.extractedText,
                    }}
                    userProfile={{ knownAllergies: selectedItem.userProfileAllergiesAtScanTime }}
                  />
                </div>
              </ScrollArea>
               <DialogClose asChild>
                  <Button type="button" variant="outline" className="mt-4 flex-shrink-0">
                    {t('close')}
                  </Button>
                </DialogClose>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AuthGuard>
  );
}
