import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { CrmDealModel } from "./crm-deal.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

function storeOid(storeId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof storeId !== "string") return storeId as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(storeId) && String(new mongoose.Types.ObjectId(storeId)) === storeId) {
    return new mongoose.Types.ObjectId(storeId);
  }
  return new mongoose.Types.ObjectId("000000000000000000000000");
}

export async function listDeals(storeId: string, query?: { stage?: string }) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const filter: Record<string, any> = { storeId: sid };
  if (query?.stage && query.stage !== "all") filter.stage = query.stage;

  const deals = await CrmDealModel.find(filter).sort({ createdAt: -1 }).lean();
  const totalPipelineValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + (d.value || 0), 0);

  return {
    deals,
    total: deals.length,
    summary: {
      totalPipelineValue,
      wonValue,
      leadsCount: deals.filter((d) => d.stage === "lead").length,
      wonCount: deals.filter((d) => d.stage === "won").length,
    },
  };
}

export async function createDeal(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);
  return CrmDealModel.create({
    ...payload,
    storeId: sid,
    value: Number(payload.value) || 0,
    customerId: payload.customerId ? oid(payload.customerId) : null,
  });
}

export async function updateDealStage(
  storeId: string,
  dealId: string,
  payload: { stage: string; notes?: string; lostReason?: string }
) {
  await connectDatabase();
  const d = await CrmDealModel.findOne({ _id: oid(dealId), storeId: storeOid(storeId) });
  if (!d) throw new Error("Deal not found");

  d.stage = payload.stage;
  if (payload.notes) d.notes = payload.notes;
  if (payload.lostReason) d.lostReason = payload.lostReason;

  await d.save();
  return d;
}
