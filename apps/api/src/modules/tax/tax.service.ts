import { connectDatabase } from "../../common/database/connection.js";
import { TaxClassModel } from "./tax-class.model.js";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  rate: z.number().min(0).optional().default(0),
  country: z.string().optional().default(""),
  region: z.string().optional().default(""),
  inclusive: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export async function listTaxClasses(storeId: string) {
  await connectDatabase();
  const taxClasses = await TaxClassModel.find({ storeId }).sort({ name: 1 }).lean();
  return { ok: true as const, data: { taxClasses } };
}

export async function createTaxClass(storeId: string, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid tax class data" };
  await connectDatabase();
  if (parsed.data.isDefault) {
    await TaxClassModel.updateMany({ storeId }, { $set: { isDefault: false } });
  }
  const taxClass = await TaxClassModel.create({ storeId, ...parsed.data });
  return { ok: true as const, data: { taxClass: taxClass.toObject() } };
}

export async function updateTaxClass(storeId: string, id: string, payload: unknown) {
  const parsed = schema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid tax class data" };
  await connectDatabase();
  if (parsed.data.isDefault) {
    await TaxClassModel.updateMany({ storeId }, { $set: { isDefault: false } });
  }
  const taxClass = await TaxClassModel.findOneAndUpdate({ _id: id, storeId }, { $set: parsed.data }, { new: true }).lean();
  if (!taxClass) return { ok: false as const, message: "Tax class not found" };
  return { ok: true as const, data: { taxClass } };
}

export async function deleteTaxClass(storeId: string, id: string) {
  await connectDatabase();
  const taxClass = await TaxClassModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!taxClass) return { ok: false as const, message: "Tax class not found" };
  return { ok: true as const, message: "Tax class deleted" };
}
