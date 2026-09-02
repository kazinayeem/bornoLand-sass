import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  requireStoreAccess,
  requireStorePermission,
} from "../../common/middleware/store-permission.middleware.js";
import {
  createStoreController,
  deleteStoreController,
  deleteStoreFaviconController,
  deleteStoreLogoController,
  getStoreBrandingController,
  getStoreBySlugController,
  getStoreController,
  getUserStoresController,
  updateStoreController,
  changeStoreThemeController,
  updateStoreBrandingController
} from "./store.controller.js";
import { getStoreSettingsController, updateStoreSettingsController } from "./store-settings.controller.js";
import { getStoreContactController, updateStoreContactController } from "./store-contact.controller.js";
import { createHomepageSliderController, deleteHomepageSliderController, listHomepageSlidersController, updateHomepageSliderController } from "./homepage-slider.controller.js";
import { listStoreOrdersController, getStoreOrderController, updateOrderStatusController, updatePaymentStatusController, addOrderNoteController, processRefundController, downloadStoreOrderInvoiceController, emailStoreOrderInvoiceController, createStoreOrderController } from "./store-order.controller.js";
import {
  cancelShipmentController,
  createShipmentController,
  getShipmentOptionsController,
  trackShipmentController,
} from "../couriers/shipment.controller.js";
import { listStoreCustomersController, getStoreCustomerController, updateStoreCustomerController } from "./store-customer.controller.js";
import { couponRouter } from "../coupons/coupon.route.js";
import { reviewRouter } from "../reviews/review.route.js";
import { collectionRouter } from "../collections/collection.route.js";
import { inventoryRouter } from "../inventory/inventory.route.js";
import { reportsRouter } from "../reports/reports.route.js";
import { shippingRouter } from "../shipping/shipping.route.js";
import { courierRouter } from "../couriers/courier.route.js";
import { taxRouter } from "../tax/tax.route.js";
import { marketingRouter } from "../marketing/marketing.route.js";
import { mediaRouter } from "../media/media.route.js";
import { storeAuditRouter } from "../audit/audit.route.js";
import { contactMessageRouter } from "../notifications/contact-message.route.js";
import { storeTrackingRouter } from "./store-tracking.route.js";
import { incompleteCheckoutRouter } from "../orders/incomplete-checkout.route.js";
import { storeSSLCommerzRouter } from "../payments/sslcommerz.route.js";

export const storeRouter: Router = Router();

storeRouter.use(requireAuth);

// ── Workspace-level store operations ──────────────────────────────────────────
storeRouter.post("/create", createStoreController);
storeRouter.get("/my-stores", getUserStoresController);
storeRouter.get("/by-slug/:slug", getStoreBySlugController);
storeRouter.get("/:id", requireStoreAccess, getStoreController);
storeRouter.put("/:id", requireStorePermission("settings:manage"), updateStoreController);
storeRouter.put("/:id/theme", requireStorePermission("settings:manage"), changeStoreThemeController);
storeRouter.get("/:id/branding", requireStoreAccess, getStoreBrandingController);
storeRouter.put("/:id/branding", requireStorePermission("settings:manage"), updateStoreBrandingController);
storeRouter.delete("/:id/branding/logo", requireStorePermission("settings:manage"), deleteStoreLogoController);
storeRouter.delete("/:id/branding/favicon", requireStorePermission("settings:manage"), deleteStoreFaviconController);
storeRouter.get("/:id/settings", requireStorePermission("settings:read"), getStoreSettingsController);
storeRouter.put("/:id/settings", requireStorePermission("settings:manage"), updateStoreSettingsController);
storeRouter.get("/:id/contact", requireStoreAccess, getStoreContactController);
storeRouter.put("/:id/contact", requireStorePermission("settings:manage"), updateStoreContactController);
storeRouter.get("/:id/sliders", requireStoreAccess, listHomepageSlidersController);
storeRouter.post("/:id/sliders", requireStorePermission("settings:manage"), createHomepageSliderController);
storeRouter.put("/:id/sliders/:sliderId", requireStorePermission("settings:manage"), updateHomepageSliderController);
storeRouter.delete("/:id/sliders/:sliderId", requireStorePermission("settings:manage"), deleteHomepageSliderController);
storeRouter.delete("/:id", requireStorePermission("settings:manage"), deleteStoreController);

// ── Orders ────────────────────────────────────────────────────────────────────
storeRouter.get("/:storeId/orders", requireStorePermission("orders:read"), listStoreOrdersController);
storeRouter.post("/:storeId/orders", requireStorePermission("orders:create"), createStoreOrderController);
storeRouter.get("/:storeId/orders/:id", requireStorePermission("orders:read"), getStoreOrderController);
storeRouter.get("/:storeId/orders/:id/invoice.pdf", requireStorePermission("orders:read"), downloadStoreOrderInvoiceController);
storeRouter.post("/:storeId/orders/:id/invoice/email", requireStorePermission("orders:read"), emailStoreOrderInvoiceController);
storeRouter.get("/:storeId/orders/:id/shipment/options", requireStorePermission("orders:read"), getShipmentOptionsController);
storeRouter.post("/:storeId/orders/:id/shipment", requireStorePermission("orders:update"), createShipmentController);
storeRouter.post("/:storeId/orders/:id/shipment/cancel", requireStorePermission("orders:update"), cancelShipmentController);
storeRouter.post("/:storeId/orders/:id/shipment/track", requireStorePermission("orders:read"), trackShipmentController);
storeRouter.put("/:storeId/orders/:id/status", requireStorePermission("orders:update"), updateOrderStatusController);
storeRouter.put("/:storeId/orders/:id/payment-status", requireStorePermission("orders:update"), updatePaymentStatusController);
storeRouter.post("/:storeId/orders/:id/notes", requireStorePermission("orders:update"), addOrderNoteController);
storeRouter.post("/:storeId/orders/:id/refund", requireStorePermission("orders:delete"), processRefundController);

// ── Customers ─────────────────────────────────────────────────────────────────
storeRouter.get("/:storeId/customers", requireStorePermission("customers:read"), listStoreCustomersController);
storeRouter.get("/:storeId/customers/:customerId", requireStorePermission("customers:read"), getStoreCustomerController);
storeRouter.put("/:storeId/customers/:customerId", requireStorePermission("customers:update"), updateStoreCustomerController);

// ── Sub-routers (store-level middleware already applied above per-route) ───────
// Note: requireStoreAccess at the use() level means all sub-router handlers are
// also protected. Sub-routers may add further permission guards internally.
storeRouter.use("/:storeId/coupons", requireStoreAccess, couponRouter);
storeRouter.use("/:storeId/reviews", requireStoreAccess, reviewRouter);
storeRouter.use("/:storeId/collections", requireStoreAccess, collectionRouter);
storeRouter.use("/:storeId/inventory", requireStoreAccess, inventoryRouter);
storeRouter.use("/:storeId/reports", requireStorePermission("reports:read"), reportsRouter);
storeRouter.use("/:storeId/shipping", requireStorePermission("shipping:read"), shippingRouter);
storeRouter.use("/:storeId/couriers", requireStoreAccess, courierRouter);
storeRouter.use("/:storeId/tax", requireStorePermission("settings:read"), taxRouter);
storeRouter.use("/:storeId/marketing", requireStorePermission("marketing:read"), marketingRouter);
storeRouter.use("/:storeId/media", requireStorePermission("media:read"), mediaRouter);
storeRouter.use("/:storeId/audit-logs", requireStorePermission("settings:read"), storeAuditRouter);
storeRouter.use("/:storeId/contact-messages", requireStoreAccess, contactMessageRouter);
storeRouter.use("/:storeId/tracking", requireStoreAccess, storeTrackingRouter);
storeRouter.use("/:id/tracking", requireStoreAccess, storeTrackingRouter);
storeRouter.use("/:storeId/incomplete-checkouts", requireStorePermission("orders:read"), incompleteCheckoutRouter);
storeRouter.use("/:id/incomplete-checkouts", requireStorePermission("orders:read"), incompleteCheckoutRouter);
storeRouter.use("/:storeId/payment-gateways/sslcommerz", requireStorePermission("payments:read"), storeSSLCommerzRouter);
storeRouter.use("/:id/payment-gateways/sslcommerz", requireStorePermission("payments:read"), storeSSLCommerzRouter);
