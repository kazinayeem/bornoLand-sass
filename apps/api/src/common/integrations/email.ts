import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const tp = getTransporter();
  if (!tp) {
    console.info(`[email] (no SMTP) ${payload.subject} -> ${payload.to}`);
    return;
  }

  const from = process.env.SMTP_FROM || "noreply@bornoland.com";
  await tp.sendMail({ from, to: payload.to, subject: payload.subject, html: payload.html, text: payload.text });
}

export async function sendEmailOrThrow(payload: EmailPayload): Promise<void> {
  const tp = getTransporter();
  if (!tp) {
    throw new Error("SMTP not configured");
  }
  const from = process.env.SMTP_FROM || "noreply@bornoland.com";
  await tp.sendMail({ from, to: payload.to, subject: payload.subject, html: payload.html, text: payload.text });
}
