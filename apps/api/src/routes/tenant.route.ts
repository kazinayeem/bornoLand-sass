import { Router } from "express";
import type { Request, Response } from "express";
import { connectDatabase } from "../config/database.js";
import { TenantModel } from "../models/tenant.model.js";

export const tenantRouter = Router();

tenantRouter.get("/:tenantId", async (request: Request, response: Response) => {
  await connectDatabase();

  const tenant = await TenantModel.findById(request.params.tenantId).lean();

  if (!tenant) {
    return response.status(404).json({ message: "Tenant not found" });
  }

  return response.json({ tenant });
});