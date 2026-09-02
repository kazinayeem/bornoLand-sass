import React from "react";
import type { StoreIdentity } from "./document-types";

interface DocumentHeaderProps {
  store: StoreIdentity;
  title: string;
  subtitle?: string;
  documentNumber?: string;
  date?: string | Date;
  status?: string;
  isThermal?: boolean;
}

export function DocumentHeader({
  store,
  title,
  subtitle,
  documentNumber,
  date,
  status,
  isThermal = false,
}: DocumentHeaderProps) {
  const formattedDate = date
    ? typeof date === "string"
      ? date
      : new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(date))
    : "";

  if (isThermal) {
    return (
      <div className="text-center pb-2 mb-2 border-b border-dashed border-zinc-400">
        <h1 className="text-base font-bold tracking-tight uppercase">{store.name}</h1>
        {store.address && <p className="text-[11px] text-zinc-700 leading-tight">{store.address}</p>}
        {store.phone && <p className="text-[11px] text-zinc-700">Tel: {store.phone}</p>}
        {store.binOrTin && <p className="text-[10px] text-zinc-600">BIN/TIN: {store.binOrTin}</p>}
        <div className="mt-2 pt-1 border-t border-dotted border-zinc-400 flex justify-between text-[11px]">
          <span className="font-semibold uppercase">{title}</span>
          {documentNumber && <span>#{documentNumber}</span>}
        </div>
        {formattedDate && (
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>Date: {formattedDate}</span>
            {status && <span className="uppercase font-semibold">{status}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between pb-6 mb-6 border-b border-zinc-200">
      {/* Left: Store identity */}
      <div className="flex items-start gap-4">
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt={store.name}
            className="h-14 w-auto max-w-[140px] object-contain"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold text-lg"
            style={{ backgroundColor: store.brandColor || "#003399" }}
          >
            {(store.shortName || store.name || "B").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-zinc-900 leading-tight">{store.name}</h1>
          {store.address && (
            <p className="text-xs text-zinc-600 mt-1 max-w-xs leading-relaxed">{store.address}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-500 mt-1">
            {store.phone && <span>Tel: {store.phone}</span>}
            {store.email && <span>Email: {store.email}</span>}
            {store.binOrTin && <span>BIN/TIN: {store.binOrTin}</span>}
          </div>
        </div>
      </div>

      {/* Right: Document details */}
      <div className="text-right">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-zinc-500 mt-0.5">{subtitle}</p>}
        {documentNumber && (
          <div className="text-sm font-semibold text-zinc-800 mt-2">
            No: <span className="font-mono text-zinc-900">{documentNumber}</span>
          </div>
        )}
        {formattedDate && (
          <div className="text-xs text-zinc-500 mt-0.5">Date: {formattedDate}</div>
        )}
        {status && (
          <div className="mt-2 inline-block">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                status === "paid" || status === "approved"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : status === "rejected" || status === "cancelled"
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
