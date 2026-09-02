import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { PosShiftModel } from "./pos-shift.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

export async function openPosShift(
  storeId: string,
  payload: {
    cashierId: string;
    cashierName: string;
    openingFloat: number;
    terminalId?: string;
    warehouseId?: string | null;
  }
) {
  await connectDatabase();
  const sid = oid(storeId);
  const cid = oid(payload.cashierId);
  if (!sid || !cid) throw new Error("Invalid store or cashier ID");

  // Check if cashier already has an open shift
  const existing = await PosShiftModel.findOne({
    storeId: sid,
    cashierId: cid,
    status: "open",
  });

  if (existing) {
    return existing;
  }

  const shift = await PosShiftModel.create({
    storeId: sid,
    cashierId: cid,
    cashierName: payload.cashierName,
    openingFloat: Math.max(0, Number(payload.openingFloat) || 0),
    expectedClosingCash: Math.max(0, Number(payload.openingFloat) || 0),
    terminalId: payload.terminalId || "TERM-01",
    warehouseId: payload.warehouseId ? oid(payload.warehouseId) : null,
    status: "open",
    openedAt: new Date(),
  });

  return shift;
}

export async function getCurrentPosShift(storeId: string, cashierId: string) {
  await connectDatabase();
  const sid = oid(storeId);
  const cid = oid(cashierId);
  if (!sid || !cid) return null;

  return PosShiftModel.findOne({
    storeId: sid,
    cashierId: cid,
    status: "open",
  }).lean();
}

export async function recordPosSaleToShift(
  storeId: string,
  cashierId: string,
  payload: {
    paymentMethod: "cash" | "card" | "bkash" | "nagad" | "rocket" | string;
    amount: number;
  }
) {
  await connectDatabase();
  const sid = oid(storeId);
  const cid = oid(cashierId);
  if (!sid || !cid) return;

  const shift = await PosShiftModel.findOne({
    storeId: sid,
    cashierId: cid,
    status: "open",
  });

  if (!shift) return;

  const method = payload.paymentMethod.toLowerCase();
  if (method === "cash" || method === "cod") {
    shift.totalCashSales += payload.amount;
    shift.expectedClosingCash = shift.openingFloat + shift.totalCashSales - shift.totalRefunds;
  } else if (method === "card" || method === "visa" || method === "mastercard") {
    shift.totalCardSales += payload.amount;
  } else {
    shift.totalMfsSales += payload.amount;
  }

  shift.totalOrdersCount += 1;
  await shift.save();
}

export async function closePosShift(
  storeId: string,
  shiftId: string,
  payload: {
    actualClosingCash: number;
    closingNotes?: string;
  }
) {
  await connectDatabase();
  const sid = oid(storeId);
  const sId = oid(shiftId);
  if (!sid || !sId) throw new Error("Invalid shift ID");

  const shift = await PosShiftModel.findOne({ _id: sId, storeId: sid });
  if (!shift) throw new Error("Shift not found");
  if (shift.status === "closed") throw new Error("Shift is already closed");

  const actual = Number(payload.actualClosingCash);
  const expected = shift.openingFloat + shift.totalCashSales - shift.totalRefunds;
  const discrepancy = actual - expected;

  shift.status = "closed";
  shift.closedAt = new Date();
  shift.actualClosingCash = actual;
  shift.expectedClosingCash = expected;
  shift.cashDiscrepancy = discrepancy;
  shift.closingNotes = payload.closingNotes ?? "";

  await shift.save();
  return shift;
}

export async function listPosShifts(
  storeId: string,
  query: { page?: number; limit?: number; cashierId?: string }
) {
  await connectDatabase();
  const sid = oid(storeId);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { storeId: sid };
  if (query.cashierId && oid(query.cashierId)) filter.cashierId = oid(query.cashierId);

  const [shifts, total] = await Promise.all([
    PosShiftModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    PosShiftModel.countDocuments(filter),
  ]);

  return {
    shifts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
