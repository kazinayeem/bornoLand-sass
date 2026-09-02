import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  openPosShift,
  getCurrentPosShift,
  closePosShift,
  listPosShifts,
} from "./pos-shift.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

export async function openPosShiftController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });

    const cashierId = request.user?.userId;
    if (!cashierId) return void response.status(401).json({ ok: false, message: "Unauthorized" });

    const shift = await openPosShift(storeId, {
      cashierId,
      cashierName: request.user?.email || "Cashier",
      openingFloat: Number(request.body.openingFloat) || 0,
      terminalId: request.body.terminalId,
      warehouseId: request.body.warehouseId,
    });

    response.status(201).json({ ok: true, data: shift });
  } catch (error: any) {
    console.error("[POS Shift] open:", error);
    response.status(400).json({ ok: false, message: error?.message || "Failed to open POS shift" });
  }
}

export async function getCurrentPosShiftController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const cashierId = request.user?.userId;
    if (!cashierId) return void response.status(401).json({ ok: false, message: "Unauthorized" });

    const shift = await getCurrentPosShift(storeId, cashierId);
    response.json({ ok: true, data: shift });
  } catch (error: any) {
    console.error("[POS Shift] current:", error);
    response.status(500).json({ ok: false, message: "Failed to get current shift" });
  }
}

export async function closePosShiftController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const shiftId = String(request.params.shiftId ?? "");
    if (!storeId || !shiftId) return void response.status(400).json({ ok: false, message: "storeId and shiftId are required" });

    const shift = await closePosShift(storeId, shiftId, {
      actualClosingCash: Number(request.body.actualClosingCash) || 0,
      closingNotes: request.body.closingNotes,
    });

    response.json({ ok: true, data: shift });
  } catch (error: any) {
    console.error("[POS Shift] close:", error);
    response.status(400).json({ ok: false, message: error?.message || "Failed to close POS shift" });
  }
}

export async function listPosShiftsController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });

    const result = await listPosShifts(storeId, request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    console.error("[POS Shift] list:", error);
    response.status(500).json({ ok: false, message: "Failed to list POS shifts" });
  }
}
