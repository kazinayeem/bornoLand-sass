"use client";

import { Suspense } from "react";
import { ReduxProvider } from "@/providers/redux-provider";
import { ApiErrorListener } from "@/providers/api-error-listener";
import { LoadingProvider } from "@/providers/loading-provider";
import {
  NavigationProgressBar,
  NavigationProgressListener,
  RtkMutationProgressListener,
} from "@/components/loading";
import { SessionInit } from "@/components/auth/session-init";

function LoadingInstrumentation() {
  return (
    <>
      <NavigationProgressListener />
      <RtkMutationProgressListener />
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <LoadingProvider>
        <ApiErrorListener />
        <SessionInit />
        <NavigationProgressBar />
        <Suspense fallback={null}>
          <LoadingInstrumentation />
        </Suspense>
        {children}
      </LoadingProvider>
    </ReduxProvider>
  );
}
