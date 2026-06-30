type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!process.env.SMTP_HOST) {
    console.info(`[email] ${payload.subject} -> ${payload.to}`);
    return;
  }

  console.info(`[email] SMTP configured for ${payload.to}`);
}