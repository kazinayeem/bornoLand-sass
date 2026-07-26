"use client";

import { memo } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

type DataGridExportProps = {
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
};

function DataGridExportInner({ onExportCsv, onExportExcel, onExportPdf, onPrint }: DataGridExportProps) {
  const items = [
    onExportCsv ? { key: "csv", label: "Export CSV", icon: Download, onClick: onExportCsv } : null,
    onExportExcel ? { key: "excel", label: "Export Excel", icon: FileSpreadsheet, onClick: onExportExcel } : null,
    onExportPdf ? { key: "pdf", label: "Export PDF Report", icon: Download, onClick: onExportPdf } : null,
    onPrint ? { key: "print", label: "Print", icon: Printer, onClick: onPrint } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; icon: typeof Download; onClick: () => void }>;

  if (items.length === 0) return null;

  return (
    <DropdownMenu
      placement="bottom-end"
      minWidth={180}
      trigger={
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-apple-hairline bg-apple-canvas px-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      }
      items={items}
    />
  );
}

export const DataGridExport = memo(DataGridExportInner);
