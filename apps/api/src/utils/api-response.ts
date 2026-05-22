import type { Response } from "express";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export function sendSuccess<T>(response: Response, data?: T, message?: string, status = 200) {
  return response.status(status).json({ success: true, data, message } satisfies ApiResponse<T>);
}

export function sendFailure(response: Response, message: string, status = 400) {
  return response.status(status).json({ success: false, message } satisfies ApiResponse<never>);
}