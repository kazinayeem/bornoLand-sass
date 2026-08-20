import { z } from "zod";

export const updateStoreSettingsSchema = z
  .object({
    currencyCode: z.enum(["USD", "BDT", "EUR", "GBP", "INR"]).optional(),
    currencySymbol: z.string().min(1).max(8).optional(),
    currencyPosition: z.enum(["before", "after"]).optional(),
    locale: z.string().min(2).max(32).optional(),
    decimalPlaces: z.number().int().min(0).max(4).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxEnabled: z.boolean().optional(),
    taxIncluded: z.boolean().optional(),
    orderPrefix: z.string().optional(),
    invoicePrefix: z.string().optional(),
    lowStockAlertEnabled: z.boolean().optional(),
    lowStockMinQuantity: z.number().nullable().optional(),
    lowStockAlertEmail: z.string().optional(),
    lowStockNotifyOwner: z.boolean().optional(),
    dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
    timezone: z.string().min(1).max(64).optional(),
    language: z.enum(["en", "bn", "es", "fr", "de", "ar", "hi", "zh", "ja", "ko"]).optional(),

    // Shipping
    shippingEnabled: z.boolean().optional(),
    freeShippingEnabled: z.boolean().optional(),
    freeShippingMin: z.number().min(0).optional(),

    // Checkout
    guestCheckoutEnabled: z.boolean().optional(),
    guestCheckout: z.boolean().optional(),
    requireLoginEnabled: z.boolean().optional(),
    requireLogin: z.boolean().optional(),
    minimumOrderAmount: z.number().min(0).optional(),
    minOrderAmount: z.number().min(0).optional(),
    autoConfirmOrders: z.boolean().optional(),
    autoConfirm: z.boolean().optional(),

    // Payment settings & aliases
    cashOnDelivery: z.boolean().optional(),
    codEnabled: z.boolean().optional(),
    paymentSettings: z
      .object({
        codEnabled: z.boolean().optional(),
        bkash: z
          .object({
            enabled: z.boolean().optional(),
            number: z.string().optional(),
            type: z.enum(["personal", "merchant"]).optional(),
            instructions: z.string().optional(),
          })
          .passthrough()
          .optional(),
        nagad: z
          .object({
            enabled: z.boolean().optional(),
            number: z.string().optional(),
            type: z.enum(["personal", "merchant"]).optional(),
            instructions: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),

    // Configured Delivery Zones
    deliveryZones: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            charge: z.number().min(0),
            estimatedDays: z.string().optional(),
            enabled: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;

