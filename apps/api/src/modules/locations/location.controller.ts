import type { Request, Response } from "express";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
  matchStoreDeliveryZone,
  validateLocationHierarchy,
} from "./location.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export async function getDivisionsController(_req: Request, res: Response) {
  const divisions = getDivisions();
  return sendSuccess(res, { divisions });
}

export async function getDistrictsController(req: Request, res: Response) {
  const divisionId = String(req.params.divisionId || req.query.divisionId || "");
  const districts = getDistricts(divisionId || undefined);
  return sendSuccess(res, { districts });
}

export async function getUpazilasController(req: Request, res: Response) {
  const districtId = String(req.params.districtId || req.query.districtId || "");
  const upazilas = getUpazilas(districtId || undefined);
  return sendSuccess(res, { upazilas });
}

export async function getUnionsController(req: Request, res: Response) {
  const upazilaId = String(req.params.upazilaId || req.query.upazilaId || "");
  if (!upazilaId) {
    return sendFailure(res, "Upazila ID is required to fetch unions", 400);
  }
  const unions = getUnions(upazilaId);
  return sendSuccess(res, { unions });
}

export async function validateHierarchyController(req: Request, res: Response) {
  const { divisionId, districtId, upazilaId, unionId } = req.body || {};
  const validation = validateLocationHierarchy({ divisionId, districtId, upazilaId, unionId });
  if (!validation.valid) {
    return sendFailure(res, validation.error || "Invalid location hierarchy", 400);
  }
  return sendSuccess(res, { valid: true });
}

export async function matchZoneController(req: Request, res: Response) {
  const storeId = String(req.query.storeId || req.body?.storeId || "");
  if (!storeId) {
    return sendFailure(res, "storeId is required to match delivery zone", 400);
  }
  const divisionId = String(req.query.divisionId || req.body?.divisionId || "");
  const districtId = String(req.query.districtId || req.body?.districtId || "");
  const upazilaId = String(req.query.upazilaId || req.body?.upazilaId || "");
  const divisionName = String(req.query.divisionName || req.body?.divisionName || "");
  const districtName = String(req.query.districtName || req.body?.districtName || "");

  const match = await matchStoreDeliveryZone(storeId, {
    divisionId,
    districtId,
    upazilaId,
    divisionName,
    districtName,
  });

  return sendSuccess(res, match);
}
