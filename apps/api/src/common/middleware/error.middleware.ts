import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export function notFoundHandler(_request: Request, response: Response) {
  return response.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ success: false, message: "Invalid ID format" });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return response.status(400).json({ success: false, message: messages.join(", ") });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ success: false, message: "Invalid JSON in request body" });
  }

  if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
    return response.status(409).json({ success: false, message: "Duplicate key error" });
  }

  console.error("[unhandled]", error instanceof Error ? error.message : error);
  return response.status(500).json({ success: false, message: "Internal server error" });
}
