import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
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
    from: process.env.EMAIL_FROM ?? "BornoLand <no-reply@bornoland.com>",
    ...options
  });
}
