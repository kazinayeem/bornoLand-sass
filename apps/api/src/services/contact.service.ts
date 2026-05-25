import { connectDatabase } from "../config/database.js";
import { ContactModel } from "../models/contact.model.js";

export async function submitContact(
  storeId: string,
  payload: { name: string; email: string; phone?: string; message: string }
) {
  await connectDatabase();
  await ContactModel.create({ storeId, ...payload });
  return { ok: true as const, message: "Message sent successfully" };
}
