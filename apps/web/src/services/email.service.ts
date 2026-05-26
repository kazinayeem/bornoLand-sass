import nodemailer from "nodemailer";
import { config } from "@/lib/config";

function getTransporter() {
  const host = config.smtpHost;
  const user = config.smtpUser;
  const pass = config.smtpPass;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(config.smtpPort),
    secure: false,
    auth: { user, pass }
  });
}

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[email] ${options.subject} -> ${options.to}`);
    return;
  }

  await transporter.sendMail({
    from: config.emailFrom,
    ...options
  });
}
