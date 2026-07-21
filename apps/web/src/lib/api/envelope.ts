export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export function assertApiSuccess<T>(
  response: ApiEnvelope<T>,
  fallbackMessage = "Request failed",
): asserts response is ApiEnvelope<T> & { success: true; data: T } {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }
}

export function getMutationErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (error && typeof error === "object") {
    const withData = error as { data?: { message?: string }; message?: string };
    if (withData.data?.message) return withData.data.message;
    if (withData.message) return withData.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
