import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(_request: Request, response: Response) {
  return response.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return response.status(500).json({ success: false, message });
}