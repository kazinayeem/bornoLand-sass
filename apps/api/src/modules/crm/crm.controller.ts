import type { Request, Response } from "express";
import { listDeals, createDeal, updateDealStage } from "./crm.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

export async function listDealsController(request: Request, response: Response) {
  try {
    const result = await listDeals(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list deals" });
  }
}

export async function createDealController(request: Request, response: Response) {
  try {
    const deal = await createDeal(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: deal });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create deal" });
  }
}

export async function updateDealStageController(request: Request, response: Response) {
  try {
    const deal = await updateDealStage(storeIdOf(request), String(request.params.dealId), request.body);
    response.json({ ok: true, data: deal });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to update deal stage" });
  }
}
