"use client";

import { ReduxProvider } from "@/providers/redux-provider";
import { ApiErrorListener } from "@/providers/api-error-listener";
import { ActionStatusProvider, TopProgressBar, ActionStatusBar } from "@/providers/action-status-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ActionStatusProvider>
        <ApiErrorListener />
        <TopProgressBar />
        {children}
        <ActionStatusBar />
      </ActionStatusProvider>
    </ReduxProvider>
  );
}
