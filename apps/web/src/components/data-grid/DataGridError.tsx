"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataGridErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function DataGridError({ message = "Could not load data.", onRetry }: DataGridErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-red-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-700">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600/80">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      ) : null}
    </div>
  );
}
