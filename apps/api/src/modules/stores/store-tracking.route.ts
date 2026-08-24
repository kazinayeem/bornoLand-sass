import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  getStoreTrackingController,
  updateMetaPixelController,
  updateTikTokPixelController,
  testPixelConnectionController,
  logStoreTrackingEventController,
} from "./store-tracking.controller.js";

export const storeTrackingRouter: Router = Router({ mergeParams: true });

storeTrackingRouter.use(requireAuth);

storeTrackingRouter.get("/", getStoreTrackingController);
storeTrackingRouter.put("/meta", updateMetaPixelController);
storeTrackingRouter.put("/tiktok", updateTikTokPixelController);
storeTrackingRouter.post("/test", testPixelConnectionController);
storeTrackingRouter.post("/events", logStoreTrackingEventController);
