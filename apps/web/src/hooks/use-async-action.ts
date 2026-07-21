"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useLoading } from "@/hooks/use-loading";
import type { ActionType } from "@/lib/loading/types";

type UseAsyncActionOptions = {
  type?: ActionType;
  subject: string;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  showActionToast?: boolean;
};

/**
 * Wraps any async function with loading state, duplicate prevention,
 * and optional global action feedback.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  options: UseAsyncActionOptions
) {
  const { startAction, finishAction } = useLoading();
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const run = useCallback(
    async (
      fn: (...args: TArgs) => Promise<TResult>,
      ...args: TArgs
    ): Promise<{ ok: true; data: TResult } | { ok: false; error: string }> => {
      if (inFlightRef.current) {
        return { ok: false, error: "Already in progress" };
      }

      inFlightRef.current = true;
      setLoading(true);

      const actionId =
        options.showActionToast !== false
          ? startAction(options.type ?? "processing", options.subject)
          : null;

      try {
        const data = await fn(...args);
        if (actionId) finishAction(actionId, "success", options.successMessage);
        if (options.showToast && options.successMessage) toast.success(options.successMessage);
        return { ok: true, data };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : options.errorMessage ?? "Something went wrong";
        if (actionId) finishAction(actionId, "error", message);
        if (options.showToast !== false) toast.error(message);
        return { ok: false, error: message };
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [finishAction, options, startAction]
  );

  return { run, loading, isLoading: loading };
}
