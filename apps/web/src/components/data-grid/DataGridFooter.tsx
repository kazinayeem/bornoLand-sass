"use client";

import { memo } from "react";
import type { Table } from "@tanstack/react-table";

type DataGridFooterProps<TData> = {
  table: Table<TData>;
  total?: number;
};

function DataGridFooterInner<TData>({ table, total }: DataGridFooterProps<TData>) {
  const selected = table.getSelectedRowModel().rows.length;
  const visible = table.getRowModel().rows.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-apple-hairline px-4 py-3 text-xs text-apple-ink-muted-48">
      <p>
        Showing <span className="font-semibold text-apple-ink">{visible}</span>
        {typeof total === "number" ? (
          <>
            {" "}
            of <span className="font-semibold text-apple-ink">{total}</span>
          </>
        ) : null}
      </p>
      {selected > 0 ? <p>{selected} selected</p> : null}
    </div>
  );
}

export const DataGridFooter = memo(DataGridFooterInner) as typeof DataGridFooterInner;
