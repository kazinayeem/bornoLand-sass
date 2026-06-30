import { connectDatabase } from "../../common/database/connection.js";
import { CampaignModel } from "./campaign.model.js";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["discount", "flash_sale", "banner", "announcement"]).default("discount"),
  description: z.string().optional().default(""),
  bannerImageUrl: z.string().optional().default(""),
  bannerLink: z.string().optional().default(""),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  productIds: z.array(z.string()).optional().default([]),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  status: z.enum(["draft", "active", "ended"]).optional().default("draft"),
});

export async function listCampaigns(storeId: string) {
  await connectDatabase();
  const campaigns = await CampaignModel.find({ storeId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { campaigns } };
}

export async function createCampaign(storeId: string, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid campaign data" };
  await connectDatabase();
  const campaign = await CampaignModel.create({
    storeId,
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
  });
  return { ok: true as const, data: { campaign: campaign.toObject() } };
}

export async function updateCampaign(storeId: string, id: string, payload: unknown) {
  const parsed = schema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid campaign data" };
  await connectDatabase();
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startsAt) update.startsAt = new Date(parsed.data.startsAt);
  if (parsed.data.endsAt) update.endsAt = new Date(parsed.data.endsAt);
  const campaign = await CampaignModel.findOneAndUpdate({ _id: id, storeId }, { $set: update }, { new: true }).lean();
  if (!campaign) return { ok: false as const, message: "Campaign not found" };
  return { ok: true as const, data: { campaign } };
}

export async function deleteCampaign(storeId: string, id: string) {
  await connectDatabase();
  const campaign = await CampaignModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!campaign) return { ok: false as const, message: "Campaign not found" };
  return { ok: true as const, message: "Campaign deleted" };
}
