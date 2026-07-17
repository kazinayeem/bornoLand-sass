"use client";

import { ReduxProvider } from "@/providers/redux-provider";
import { ApiErrorListener } from "@/providers/api-error-listener";
import { ActionStatusProvider, TopProgressBar, ActionStatusBar } from "@/providers/action-status-provider";
import { SessionInit } from "@/components/auth/session-init";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ActionStatusProvider>
        <ApiErrorListener />
        <SessionInit />
        <TopProgressBar />
        {children}
        <ActionStatusBar />
      </ActionStatusProvider>
    </ReduxProvider>
  );
}
