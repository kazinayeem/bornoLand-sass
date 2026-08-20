"use client";

import dynamic from "next/dynamic";
import { BuilderLoadingScreen } from "@/components/builder/builder-loading-screen";
import { useStoreContext } from "@/providers/store-context";

/**
 * Client entry-point for the Builder editor.
 *
 * WHY THE GATE EXISTS:
 * During client-side navigation (e.g. Dashboard → Builder) the App Router
 * re-renders StoreLayout, which triggers a fresh RTK Query for the store.
 * Until that query resolves, StoreContext.isReady = false.
 *
 * BuilderEditor and every sub-component it renders (Toolbar, Sidebar,
 * PropertiesPanel, MediaPanel, TemplatesPanel) all call useRequiredStore(),
 * which throws synchronously when isReady = false.
 *
 * BuilderShell shows a loading screen during this window — but because
 * editor-client is a child of BuilderShell (passed as {children}), Next.js
 * starts mounting it *concurrently* with the loading screen render.
 * The resulting throw is uncaught and crashes the page.
 *
 * On a browser reload, getStoreContext() runs server-side and passes
 * initialStore to StoreProvider, so isReady = true immediately and there
 * is no throw.
 *
 * FIX: We consume useStoreContext() here (which never throws) and
 * keep the editor in a loading state until isReady = true. This makes
 * first-click navigation behave identically to a browser reload.
 */
const BuilderEditor = dynamic(
  () => import("@/components/builder/builder-editor").then((module) => module.BuilderEditor),
  {
    ssr: false,
    loading: () => <BuilderLoadingScreen message="Loading sections…" />,
  },
);

export default function BuilderEditorPage() {
  const { isReady, isLoading, isError } = useStoreContext();

  // Store not ready yet — show the loading screen.
  // BuilderShell already shows one, but this guard prevents BuilderEditor
  // from mounting (and calling useRequiredStore) before the context is ready.
  if (!isReady || isLoading) {
    return <BuilderLoadingScreen message="Preparing your workspace…" />;
  }

  if (isError) {
    // BuilderShell handles the error state above us; this is a safety fallback.
    return null;
  }

  return <BuilderEditor />;
}
