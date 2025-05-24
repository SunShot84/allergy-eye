
"use client";

import React, { useState } from 'react';
import { ScanHistoryList } from '@/components/allergy-eye/scan-history-list';
import useLocalStorage from '@/hooks/use-local-storage';
import { SCAN_HISTORY_STORAGE_KEY } from '@/lib/constants';
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

const HistoryPage_INITIAL_SCAN_HISTORY: ScanResultItem[] = [];

export default function HistoryPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResultItem[]>(SCAN_HISTORY_STORAGE_KEY, HistoryPage_INITIAL_SCAN_HISTORY);
  const [selectedItem, setSelectedItem] = useState<ScanResultItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewItem = (item: ScanResultItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setScanHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
    // Close modal if the deleted item was selected
    if (selectedItem && selectedItem.id === itemId) {
      closeModal();
    }
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    closeModal(); // Close modal if open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat(currentLocale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ScanHistoryList
        historyItems={scanHistory}
        onViewItem={handleViewItem}
        onDeleteItem={handleDeleteItem}
        onClearHistory={handleClearHistory}
      />

      {selectedItem && (
        <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) closeModal(); else setIsModalOpen(true); }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">{t('history.scanDetailsTitle')}</DialogTitle>
              <DialogDescription>
                {t('history.scanDetailsDescription', { timestamp: formatTimestamp(selectedItem.timestamp) })}
              </DialogDescription>
            </DialogHeader>
            {/* Ensure ScrollArea takes up available space and its content can indeed overflow */}
            <ScrollArea className="flex-grow min-h-0"> {/* Added min-h-0 for better flex behavior */}
              <div className="space-y-4 py-4">
                <div className="relative w-full h-64 rounded-md overflow-hidden border">
                  <Image
                    src={selectedItem.imageDataUrl}
                    alt={t('history.scannedFoodAlt') || "Scanned food item"}
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
                  }}
                  userProfileAllergies={selectedItem.userProfileAllergiesAtScanTime}
                />
              </div>
            </ScrollArea>
             <DialogClose asChild>
                <Button type="button" variant="outline" className="mt-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
                  {t('close')}
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
