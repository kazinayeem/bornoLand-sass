import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { z } from "zod";
import { getDecryptedEmailConfig } from "./store-email-config.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../../models/store.model.js";

const testEmailSchema = z.object({
  recipient: z.string().email(),
});

export async function sendTestEmailController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const parsed = testEmailSchema.safeParse(request.body);
  if (!parsed.success) return sendFailure(response, "Valid recipient email is required", 400);

  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return sendFailure(response, "Store not found", 404);

  const config = await getDecryptedEmailConfig(storeId);
  if (!config) {
    return sendFailure(response, "SMTP not configured or not enabled. Please configure your SMTP settings first.", 400);
  }

  try {
    const nodemailer = await import("nodemailer");
    const secure = config.encryption === "ssl" || config.smtpPort === 465;
    const tls: Record<string, unknown> = {};
    if (config.encryption === "starttls") {
      tls.rejectUnauthorized = false;
    }

    const transporter = nodemailer.default.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure,
      auth: config.smtpUser && config.smtpPass
        ? { user: config.smtpUser, pass: config.smtpPass }
        : undefined,
      ...(Object.keys(tls).length ? { tls } : {}),
    });

    await transporter.sendMail({
      from: config.senderName
        ? `"${config.senderName}" <${config.senderEmail}>`
        : config.senderEmail,
      to: parsed.data.recipient,
      subject: "Test Email from " + (store as Record<string, unknown>).name,
      html: `<h1>Test Email</h1><p>This is a test email from your store <strong>${(store as Record<string, unknown>).name}</strong>.</p><p>If you received this, your SMTP configuration is working correctly.</p><hr/><p><small>Sent at: ${new Date().toISOString()}</small></p>`,
      replyTo: config.replyToEmail || undefined,
    });

    return sendSuccess(response, { recipient: parsed.data.recipient }, "Test email sent successfully");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown SMTP error";
    return sendFailure(response, `SMTP test failed: ${errorMsg}`, 400);
  }
}
