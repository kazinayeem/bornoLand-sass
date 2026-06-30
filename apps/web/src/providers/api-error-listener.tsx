"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type ApiErrorDetail = {
  status: number | string;
  message: string;
};

export function ApiErrorListener() {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorDetail>).detail;
      if (!detail?.message) return;
      toast.error(detail.message);
    };

    window.addEventListener("app:api-error", handler);
    return () => window.removeEventListener("app:api-error", handler);
  }, []);

  return null;
}
