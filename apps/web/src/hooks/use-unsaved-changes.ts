"use client";

import { useEffect, useCallback } from "react";

export function useUnsavedChangesWarning(isDirty: boolean, message = "You have unsaved changes. Leave anyway?") {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, message]);

  const confirmLeave = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm(message);
  }, [isDirty, message]);

  return { confirmLeave };
}
