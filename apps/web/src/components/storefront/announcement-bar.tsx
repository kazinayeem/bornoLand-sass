"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { StorefrontSectionLike } from "./storefront-types";

export function AnnouncementBar({ section }: { section?: StorefrontSectionLike }) {
  const [dismissed, setDismissed] = useState(false);
  const props = section?.props ?? {};
  const text = (props.text as string) || "";
  const link = (props.link as string) || "";
  const linkText = (props.linkText as string) || "";
  const bg = (props.backgroundColor as string) || "#18181b";
  const color = (props.textColor as string) || "#ffffff";
  const showClose = props.showClose !== "false";

  if (dismissed || !text) return null;

  return (
    <div className="relative flex items-center justify-center px-4 py-2 text-xs sm:text-sm" style={{ backgroundColor: bg, color }}>
      <span className="truncate">{text}</span>
      {link && linkText && (
        <Link href={link} className="ml-2 shrink-0 font-medium underline underline-offset-2 hover:opacity-80">
          {linkText}
        </Link>
      )}
      {showClose && (
        <button onClick={() => setDismissed(true)} className="ml-3 shrink-0 rounded p-0.5 hover:opacity-80">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
