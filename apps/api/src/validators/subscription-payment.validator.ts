import { z } from "zod";

export const submitSubscriptionPaymentSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "bank"]),
  senderNumber: z.string().min(6).max(20),
  transactionId: z.string().min(4).max(80),
  screenshotUrl: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const rejectPaymentSchema = z.object({
  reason: z.string().min(3).max(500),
});

export const approvePaymentSchema = z.object({
  subscriptionExpireDate: z.string().datetime().optional(),
});

export const updatePlatformPaymentMethodSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  accountNumber: z.string().min(1).max(80).optional(),
  accountName: z.string().max(80).optional(),
  bankName: z.string().max(80).optional(),
  branchName: z.string().max(80).optional(),
  instructions: z.string().max(1000).optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
