"use client";

import { ReduxProvider } from "@/providers/redux-provider";
import { ApiErrorListener } from "@/providers/api-error-listener";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ApiErrorListener />
      {children}
    </ReduxProvider>
  );
}
