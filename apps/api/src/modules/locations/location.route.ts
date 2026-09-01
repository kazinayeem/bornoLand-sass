import { Router } from "express";
import {
  getDivisionsController,
  getDistrictsController,
  getUpazilasController,
  getUnionsController,
  validateHierarchyController,
  matchZoneController,
} from "./location.controller.js";

export const locationRouter: Router = Router();

// Public location endpoints for checkout
locationRouter.get("/divisions", getDivisionsController);
locationRouter.get("/countries/BD/divisions", getDivisionsController);
locationRouter.get("/districts", getDistrictsController);
locationRouter.get("/divisions/:divisionId/districts", getDistrictsController);
locationRouter.get("/upazilas", getUpazilasController);
locationRouter.get("/districts/:districtId/upazilas", getUpazilasController);
locationRouter.get("/unions", getUnionsController);
locationRouter.get("/upazilas/:upazilaId/unions", getUnionsController);
locationRouter.post("/validate", validateHierarchyController);
locationRouter.get("/match-zone", matchZoneController);
locationRouter.post("/match-zone", matchZoneController);
