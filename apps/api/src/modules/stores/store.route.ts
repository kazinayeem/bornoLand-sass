import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  createStoreController,
  deleteStoreController,
  getStoreBySlugController,
  getStoreController,
  getUserStoresController,
  updateStoreController,
  changeStoreThemeController
} from "./store.controller.js";
import { getStoreSettingsController, updateStoreSettingsController } from "./store-settings.controller.js";
import { createHomepageSliderController, deleteHomepageSliderController, listHomepageSlidersController, updateHomepageSliderController } from "./homepage-slider.controller.js";
import { listStoreOrdersController, getStoreOrderController, updateOrderStatusController, updatePaymentStatusController, addOrderNoteController, processRefundController } from "./store-order.controller.js";
import { couponRouter } from "../coupons/coupon.route.js";
import { reviewRouter } from "../reviews/review.route.js";
import { collectionRouter } from "../collections/collection.route.js";
import { inventoryRouter } from "../inventory/inventory.route.js";
import { reportsRouter } from "../reports/reports.route.js";
import { shippingRouter } from "../shipping/shipping.route.js";
import { taxRouter } from "../tax/tax.route.js";
import { marketingRouter } from "../marketing/marketing.route.js";
import { mediaRouter } from "../media/media.route.js";

export const storeRouter: Router = Router();

storeRouter.use(requireAuth);

storeRouter.post("/create", createStoreController);
storeRouter.get("/my-stores", getUserStoresController);
storeRouter.get("/by-slug/:slug", getStoreBySlugController);
storeRouter.get("/:id", getStoreController);
storeRouter.put("/:id", updateStoreController);
storeRouter.put("/:id/theme", changeStoreThemeController);
storeRouter.get("/:id/settings", getStoreSettingsController);
storeRouter.put("/:id/settings", updateStoreSettingsController);
storeRouter.get("/:id/sliders", listHomepageSlidersController);
storeRouter.post("/:id/sliders", createHomepageSliderController);
storeRouter.put("/:id/sliders/:sliderId", updateHomepageSliderController);
storeRouter.delete("/:id/sliders/:sliderId", deleteHomepageSliderController);
storeRouter.delete("/:id", deleteStoreController);

storeRouter.get("/:storeId/orders", listStoreOrdersController);
storeRouter.get("/:storeId/orders/:id", getStoreOrderController);
storeRouter.put("/:storeId/orders/:id/status", updateOrderStatusController);
storeRouter.put("/:storeId/orders/:id/payment-status", updatePaymentStatusController);
storeRouter.post("/:storeId/orders/:id/notes", addOrderNoteController);
storeRouter.post("/:storeId/orders/:id/refund", processRefundController);

storeRouter.use("/:storeId/coupons", couponRouter);
storeRouter.use("/:storeId/reviews", reviewRouter);
storeRouter.use("/:storeId/collections", collectionRouter);
storeRouter.use("/:storeId/inventory", inventoryRouter);
storeRouter.use("/:storeId/reports", reportsRouter);
storeRouter.use("/:storeId/shipping", shippingRouter);
storeRouter.use("/:storeId/tax", taxRouter);
storeRouter.use("/:storeId/marketing", marketingRouter);
storeRouter.use("/:storeId/media", mediaRouter);
