import type { ReactNode } from "react";
import { StoreShell } from "@/components/store-dashboard/store-shell";

/** SSR — store dashboard always serves fresh authenticated data */
export const dynamic = "force-dynamic";

export default function StoreShellLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
