
"use client";

import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      aria-live="assertive"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
