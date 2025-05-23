
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

const INITIAL_SCAN_HISTORY: ScanResultItem[] = [];

export default function HistoryPage() {
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResultItem[]>(SCAN_HISTORY_STORAGE_KEY, INITIAL_SCAN_HISTORY);
  const [selectedItem, setSelectedItem] = useState<ScanResultItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewItem = (item: ScanResultItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setScanHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }

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
              <DialogTitle className="text-2xl">Scan Details</DialogTitle>
              <DialogDescription>
                Details for scan from {new Date(selectedItem.timestamp).toLocaleString()}.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-2 -mr-2"> {/* Added negative margin to compensate for scrollbar */}
              <div className="space-y-4 py-4">
                <div className="relative w-full h-64 rounded-md overflow-hidden border">
                  <Image
                    src={selectedItem.imageDataUrl}
                    alt="Scanned food item"
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
                <Button type="button" variant="outline" className="mt-4">
                  Close
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
