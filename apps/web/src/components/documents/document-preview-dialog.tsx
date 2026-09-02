"use client";

import React, { useState, useCallback, type ReactNode } from "react";
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintPortal } from "./print-portal";
import type { DocumentPageSize } from "./document-types";

interface DocumentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  filename?: string;
  defaultPageSize?: DocumentPageSize;
  allowPageSizeSwitch?: boolean;
  children: ReactNode;
}

export function DocumentPreviewDialog({
  open,
  onClose,
  title,
  filename = "document.pdf",
  defaultPageSize = "a4-portrait",
  allowPageSizeSwitch = false,
  children,
}: DocumentPreviewDialogProps) {
  const [pageSize, setPageSize] = useState<DocumentPageSize>(defaultPageSize);
  const [zoom, setZoom] = useState<number>(100);

  const handlePrint = useCallback(() => {
    // Print triggers the browser native print dialog.
    // Because PrintPortal is active and body has 'has-printable-document',
    // only #bornoland-print-root will be visible in the print output.
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(() => {
    // Trigger print with instruction, or if browser provides Save as PDF
    window.print();
  }, []);

  if (!open) return null;

  return (
    <>
      {/* 1. Screen Interactive Modal (Hidden in @media print) */}
      <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900/80 backdrop-blur-xs no-print">
        {/* Top Control Bar */}
        <header className="flex h-14 w-full items-center justify-between border-b border-zinc-700/80 bg-zinc-900 px-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
              <span className="text-[11px] text-zinc-400 font-mono uppercase">{pageSize}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Page Size Switcher (if allowed) */}
            {allowPageSizeSwitch && (
              <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 text-xs text-zinc-400 mr-2">
                <button
                  type="button"
                  onClick={() => setPageSize("a4-portrait")}
                  className={`px-2 py-1 rounded font-medium ${
                    pageSize === "a4-portrait" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"
                  }`}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize("thermal-80")}
                  className={`px-2 py-1 rounded font-medium ${
                    pageSize === "thermal-80" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize("thermal-58")}
                  className={`px-2 py-1 rounded font-medium ${
                    pageSize === "thermal-58" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"
                  }`}
                >
                  58mm
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center rounded-lg bg-zinc-800 p-0.5 text-zinc-400 mr-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-mono text-zinc-300">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                className="p-1 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="p-1 hover:text-white border-l border-zinc-700 ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              className="gap-1.5 bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Document Canvas on Screen */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* 2. Print Portal — Rendered in #bornoland-print-root for the printer */}
      <PrintPortal pageSize={pageSize} active={open}>
        {children}
      </PrintPortal>
    </>
  );
}
