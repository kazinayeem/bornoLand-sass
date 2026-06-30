import { connectDatabase } from "../../common/database/connection.js";
import { NewsletterModel } from "../../models/newsletter.model.js";

export async function subscribe(storeId: string, email: string) {
  await connectDatabase();

  const existing = await NewsletterModel.findOne({ storeId, email: email.toLowerCase() });
  if (existing) return { ok: false as const, message: "Already subscribed" };

  await NewsletterModel.create({ storeId, email: email.toLowerCase() });
  return { ok: true as const, message: "Subscribed successfully" };
}
