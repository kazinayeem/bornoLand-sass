import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { connectDatabase } from "../config/database.js";

export const billingRouter = Router();

const webhookSchema = z.object({
  eventType: z.string(),
  provider: z.enum(["stripe", "sslcommerz"]),
  payload: z.record(z.string(), z.unknown())
});

billingRouter.post("/webhook", async (request: Request, response: Response) => {
  await connectDatabase();

  const parsed = webhookSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid billing webhook" });
  }

  return response.json({
    received: true,
    provider: parsed.data.provider,
    eventType: parsed.data.eventType
  });
});