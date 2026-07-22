"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/access-token";
import { getStorefrontTenantHeaders } from "@/lib/tenant-resolution";
import { getApiUrl } from "@/lib/urls";

export type BuilderSaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export type BuilderDraftPayload = {
  id: string;
  storeId: string;
  sections: unknown[];
  headerSections: unknown[];
  footerSections: unknown[];
  headerSettings: Record<string, unknown>;
  footerSettings: Record<string, unknown>;
  theme: Record<string, unknown>;
  settings: Record<string, unknown>;
};

const IDLE_SAVE_MS = 30_000;
const SAVED_HIDE_MS = 2_000;
const RETRY_BASE_MS = 4_000;
const RETRY_MAX_MS = 30_000;

type Options = {
  isDirty: boolean;
  /** Bumps whenever builder content changes — resets the idle timer and protects concurrent edits. */
  revision: string | number;
  getPayload: () => BuilderDraftPayload | null;
  saveDraft: (payload: BuilderDraftPayload) => Promise<void>;
  onSaved?: (iso: string) => void;
  onError?: (message: string) => void;
  onSavingChange?: (saving: boolean) => void;
  idleMs?: number;
};

/**
 * Framer/Figma-style autosave:
 * - Mark unsaved immediately when dirty
 * - Save only after `idleMs` of no changes (default 30s)
 * - Force-save on demand (publish, preview, leave, unload)
 * - Queue + dedupe in-flight requests; retry on failure
 * - Never mark saved if newer edits arrived during the request
 */
export function useBuilderAutoSave({
  isDirty,
  revision,
  getPayload,
  saveDraft,
  onSaved,
  onError,
  onSavingChange,
  idleMs = IDLE_SAVE_MS,
}: Options) {
  const [status, setStatus] = useState<BuilderSaveStatus>("idle");
  const statusRef = useRef<BuilderSaveStatus>("idle");
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const dirtyRef = useRef(isDirty);
  const revisionRef = useRef(revision);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const getPayloadRef = useRef(getPayload);
  const saveDraftRef = useRef(saveDraft);
  const onSavedRef = useRef(onSaved);
  const onErrorRef = useRef(onError);
  const onSavingChangeRef = useRef(onSavingChange);

  getPayloadRef.current = getPayload;
  saveDraftRef.current = saveDraft;
  onSavedRef.current = onSaved;
  onErrorRef.current = onError;
  onSavingChangeRef.current = onSavingChange;
  dirtyRef.current = isDirty;
  revisionRef.current = revision;

  const setStatusSafe = useCallback((next: BuilderSaveStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const scheduleIdleSave = useCallback(() => {
    clearIdleTimer();
    if (!dirtyRef.current) return;
    idleTimerRef.current = setTimeout(() => {
      void runSaveRef.current("idle");
    }, idleMs);
  }, [clearIdleTimer, idleMs]);

  const runSaveRef = useRef<(reason: "idle" | "force" | "retry") => Promise<boolean>>(async () => false);

  runSaveRef.current = async (reason: "idle" | "force" | "retry" = "force"): Promise<boolean> => {
    if (!dirtyRef.current) return true;

    if (savingRef.current) {
      queuedRef.current = true;
      return false;
    }

    const payload = getPayloadRef.current();
    if (!payload?.id) return false;

    const revisionAtStart = revisionRef.current;
    savingRef.current = true;
    queuedRef.current = false;
    clearIdleTimer();
    clearRetryTimer();
    setStatusSafe("saving");
    onSavingChangeRef.current?.(true);

    try {
      await saveDraftRef.current(payload);

      // Newer edits landed while the request was in flight — keep dirty, reschedule.
      if (revisionRef.current !== revisionAtStart) {
        setStatusSafe("unsaved");
        scheduleIdleSave();
        return false;
      }

      const iso = new Date().toISOString();
      onSavedRef.current?.(iso);
      retryAttemptRef.current = 0;
      setStatusSafe("saved");
      if (savedHideTimerRef.current) clearTimeout(savedHideTimerRef.current);
      savedHideTimerRef.current = setTimeout(() => {
        if (statusRef.current === "saved" && !dirtyRef.current) {
          setStatusSafe("idle");
        }
      }, SAVED_HIDE_MS);
      return true;
    } catch {
      const message = "Save failed — we'll retry automatically";
      onErrorRef.current?.(message);
      setStatusSafe("error");
      retryAttemptRef.current += 1;
      const delay = Math.min(
        RETRY_MAX_MS,
        RETRY_BASE_MS * 2 ** Math.min(retryAttemptRef.current - 1, 4),
      );
      clearRetryTimer();
      retryTimerRef.current = setTimeout(() => {
        void runSaveRef.current("retry");
      }, delay);
      return false;
    } finally {
      savingRef.current = false;
      onSavingChangeRef.current?.(false);
      if (queuedRef.current && dirtyRef.current) {
        queuedRef.current = false;
        void runSaveRef.current("force");
      } else if (dirtyRef.current && statusRef.current === "unsaved") {
        scheduleIdleSave();
      }
    }
  };

  const saveNow = useCallback(async () => runSaveRef.current("force"), []);

  // Dirty / revision → unsaved + reset 30s idle timer
  useEffect(() => {
    if (!isDirty) {
      clearIdleTimer();
      return;
    }
    if (statusRef.current !== "saving") {
      setStatusSafe("unsaved");
    }
    scheduleIdleSave();
  }, [isDirty, revision, scheduleIdleSave, clearIdleTimer, setStatusSafe]);

  const flushKeepalive = useCallback(() => {
    if (!dirtyRef.current) return;
    const payload = getPayloadRef.current();
    if (!payload?.id) return;
    const apiUrl = getApiUrl();
    if (!apiUrl) return;
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...getStorefrontTenantHeaders(),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      void fetch(`${apiUrl}/store-pages/${payload.id}/draft`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          storeId: payload.storeId,
          sections: payload.sections,
          headerSections: payload.headerSections,
          footerSections: payload.footerSections,
          headerSettings: payload.headerSettings,
          footerSettings: payload.footerSettings,
          theme: payload.theme,
          settings: payload.settings,
        }),
        keepalive: true,
      });
    } catch {
      // beforeunload warning still protects the user
    }
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      flushKeepalive();
      e.preventDefault();
      e.returnValue = "";
    };
    const onPageHide = () => {
      if (dirtyRef.current) flushKeepalive();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && dirtyRef.current) {
        void runSaveRef.current("force");
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flushKeepalive]);

  useEffect(() => {
    return () => {
      clearIdleTimer();
      clearRetryTimer();
      if (savedHideTimerRef.current) clearTimeout(savedHideTimerRef.current);
      // Route unmount / leave Builder — best-effort flush
      if (dirtyRef.current) flushKeepalive();
    };
  }, [clearIdleTimer, clearRetryTimer, flushKeepalive]);

  return {
    status,
    saveNow,
    flushKeepalive,
  };
}

export function builderSaveStatusLabel(status: BuilderSaveStatus): string | null {
  switch (status) {
    case "unsaved":
      return "● Unsaved changes";
    case "saving":
      return "Saving…";
    case "saved":
      return "✓ All changes saved";
    case "error":
      return "Save failed — retrying…";
    default:
      return null;
  }
}
