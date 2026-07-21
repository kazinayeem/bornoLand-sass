"use client";

import { useCallback, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useLoading } from "@/hooks/use-loading";
import type { ActionType } from "@/lib/loading/types";

type UseFormSubmitOptions<T extends FieldValues> = {
  form: UseFormReturn<T>;
  type?: ActionType;
  subject: string;
  successMessage?: string;
  onSuccess?: (data: unknown) => void | Promise<void>;
};

export function useFormSubmit<T extends FieldValues>({
  form,
  type = "saving",
  subject,
  successMessage,
  onSuccess,
}: UseFormSubmitOptions<T>) {
  const { startAction, finishAction } = useLoading();
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  const handleSubmit = useCallback(
    (handler: (values: T) => Promise<void>) =>
      form.handleSubmit(async (values) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setSubmitting(true);
        const actionId = startAction(type, subject);

        try {
          await handler(values);
          finishAction(actionId, "success", successMessage);
          if (successMessage) toast.success(successMessage);
          await onSuccess?.(values);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Submission failed";
          finishAction(actionId, "error", message);
          toast.error(message);
        } finally {
          inFlightRef.current = false;
          setSubmitting(false);
        }
      }),
    [form, finishAction, onSuccess, startAction, subject, successMessage, type]
  );

  return { handleSubmit, submitting, isSubmitting: submitting };
}
