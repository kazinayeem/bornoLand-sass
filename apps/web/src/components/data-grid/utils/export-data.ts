import type { ColumnDef } from "@tanstack/react-table";

type AccessorColumn<T> = ColumnDef<T, unknown> & {
  accessorKey?: string;
  accessorFn?: (row: T, index: number) => unknown;
};

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportRowsToCsv<T>(
  rows: T[],
  columns: ColumnDef<T, unknown>[],
  filename = "export.csv",
) {
  const exportable = columns.filter((col) => col.id && col.id !== "select" && col.id !== "actions");
  const headers = exportable.map((col) => {
    const meta = col.meta as { label?: string } | undefined;
    return meta?.label ?? col.id ?? "";
  });

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      exportable
        .map((col) => {
          const accessorCol = col as AccessorColumn<T>;
          if (typeof accessorCol.accessorFn === "function") return escapeCsv(accessorCol.accessorFn(row, 0));
          if (typeof accessorCol.accessorKey === "string") {
            const value = (row as Record<string, unknown>)[accessorCol.accessorKey];
            return escapeCsv(value);
          }
          return "";
        })
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printDataGrid(title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>${title}</title></head><body>`);
  printWindow.document.write(`<h1>${title}</h1>`);
  printWindow.document.write(document.querySelector("[data-grid-print-root]")?.innerHTML ?? "");
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}
