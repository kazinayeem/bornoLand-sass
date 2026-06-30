import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  createFeatureController,
  createFeatureGroupController,
  deleteFeatureController,
  getFeatureDetailController,
  getFeatureTiersController,
  getPlanFeaturesController,
  getStoreFeatureAccessController,
  listFeatureGroupsController,
  listFeaturesController,
  setFeatureTiersController,
  setPlanFeaturesController,
  updateFeatureController,
  updateFeatureGroupController,
} from "./feature.controller.js";

export const featureRouter: Router = Router();

featureRouter.use(requireAuth);

featureRouter.get("/stores/:storeId/access", getStoreFeatureAccessController);

featureRouter.use(requireRole("super_admin"));

featureRouter.get("/groups", listFeatureGroupsController);
featureRouter.post("/groups", createFeatureGroupController);
featureRouter.put("/groups/:key", updateFeatureGroupController);

featureRouter.get("/plans/:planId", getPlanFeaturesController);
featureRouter.put("/plans/:planId", setPlanFeaturesController);

featureRouter.get("/", listFeaturesController);
featureRouter.post("/", createFeatureController);

featureRouter.get("/:key/tiers", getFeatureTiersController);
featureRouter.put("/:key/tiers", setFeatureTiersController);
featureRouter.get("/:key", getFeatureDetailController);
featureRouter.put("/:key", updateFeatureController);
featureRouter.delete("/:key", deleteFeatureController);
