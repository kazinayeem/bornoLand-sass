import nodemailer from "nodemailer";
import { getDecryptedEmailConfig } from "./store-email-config.service.js";
import { getTemplateByName } from "./store-email-template.service.js";
import { getEmailBranding } from "./store-email-branding.service.js";
import { createEmailLog, updateEmailLogStatus } from "./store-email-log.service.js";
import { getWebUrl } from "../../common/utils/app-url.js";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
};

type SendOptions = {
  storeId: string;
  to: string;
  templateName?: string;
  subject?: string;
  html?: string;
  variables?: Record<string, string>;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
};

const transporterCache = new Map<string, nodemailer.Transporter>();

function getCachedTransporter(cacheKey: string): nodemailer.Transporter | undefined {
  return transporterCache.get(cacheKey);
}

function setCachedTransporter(cacheKey: string, transporter: nodemailer.Transporter) {
  if (transporterCache.size > 100) {
    const firstKey = transporterCache.keys().next().value;
    if (firstKey) transporterCache.delete(firstKey);
  }
  transporterCache.set(cacheKey, transporter);
}

function createTransporter(config: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  encryption: string;
}): nodemailer.Transporter {
  const secure = config.encryption === "ssl" || config.smtpPort === 465;
  const tls: Record<string, unknown> = {};

  if (config.encryption === "starttls") {
    tls.rejectUnauthorized = false;
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure,
    auth: config.smtpUser && config.smtpPass
      ? { user: config.smtpUser, pass: config.smtpPass }
      : undefined,
    ...(Object.keys(tls).length ? { tls } : {}),
  });
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

export async function sendStoreEmail(options: SendOptions): Promise<{
  success: boolean;
  message: string;
  logId?: string;
}> {
  try {
    const config = await getDecryptedEmailConfig(options.storeId);
    if (!config) {
      return { success: false, message: "Store SMTP not configured or not enabled" };
    }

    const cacheKey = `${options.storeId}_${config.smtpHost}_${config.smtpPort}_${config.smtpUser}`;
    let transporter = getCachedTransporter(cacheKey);

    if (!transporter) {
      transporter = createTransporter(config);
      setCachedTransporter(cacheKey, transporter);
    }

    let subject = options.subject ?? "";
    let html = options.html ?? "";
    let templateName = options.templateName ?? "";

    if (options.templateName && !options.html) {
      const template = await getTemplateByName(options.storeId, options.templateName) as Record<string, unknown> | null;
      if (template) {
        templateName = template.name as string;
        subject = template.subject as string;
        html = template.body as string;
      }
    }

    const vars: Record<string, string> = {
      ...(options.variables ?? {}),
      currentYear: String(new Date().getFullYear()),
      storeUrl: getWebUrl(),
    };

    if (options.variables?.storeId) {
      const branding = await getEmailBranding(options.storeId);
      if (branding.ok && branding.data?.branding) {
        const b = branding.data.branding;
        vars["store.logo"] = b.logo || vars["store.logo"] || "";
        vars["store.phone"] = b.phone || vars["store.phone"] || "";
        vars["store.address"] = b.address || vars["store.address"] || "";
        vars["store.email"] = b.supportEmail || config.senderEmail || vars["store.email"] || "";
      }
    }

    if (subject.includes("{{")) {
      subject = renderTemplate(subject, vars);
    }
    if (html.includes("{{")) {
      html = renderTemplate(html, vars);
    }

    if (config.bccEmail) {
      html = html.replace("</body>", `<img src="${getWebUrl()}/api/email/track?storeId=${options.storeId}" alt="" style="display:none"/></body>`);
    }

    const log = await createEmailLog({
      storeId: options.storeId,
      recipient: options.to,
      subject,
      templateName,
      status: "pending",
    });

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: config.senderName
          ? `"${config.senderName}" <${config.senderEmail}>`
          : config.senderEmail,
        to: options.to,
        subject,
        html,
        text: options.attachments ? undefined : html.replace(/<[^>]*>/g, ""),
        replyTo: config.replyToEmail || undefined,
      };

      if (config.bccEmail) {
        mailOptions.bcc = config.bccEmail;
      }

      if (options.attachments?.length) {
        mailOptions.attachments = options.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        }));
      }

      const info = await transporter.sendMail(mailOptions);

      await updateEmailLogStatus(String(log._id), "sent", {
        providerResponse: info.messageId ? `MessageId: ${info.messageId}` : "Sent",
      });

      return { success: true, message: "Email sent successfully", logId: String(log._id) };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await updateEmailLogStatus(String(log._id), "failed", {
        errorMessage: errorMsg,
        providerResponse: "Send failed",
      });
      return { success: false, message: errorMsg, logId: String(log._id) };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMsg };
  }
}
