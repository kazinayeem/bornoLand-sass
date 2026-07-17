import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";

function formatZodError(error: ZodError): string {
  return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
}

export function validate(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      request.body = schema.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(400).json({ success: false, message: formatZodError(error) });
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      request.query = schema.parse(request.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(400).json({ success: false, message: formatZodError(error) });
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      request.params = schema.parse(request.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(400).json({ success: false, message: formatZodError(error) });
      }
      next(error);
    }
  };
}
