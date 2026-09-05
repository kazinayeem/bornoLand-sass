import { Router } from "express";
import type { Response } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import {
  resolveTenantFromSubdomainController,
  resolveTenantBySlugController,
  resolveTenantByHostController,
  resolveProductByHostController,
  resolveProductBySlugController,
  getPublicProductsController,
  paymentMethodsController,
  deliveryZonesController,
} from "./public.controller.js";
import { getPublicPageController, getPublicFaqsController, getPublicBlogPostsController } from "./cms.controller.js";
import { getPublicStoreContactController } from "../stores/store-contact.controller.js";
import { trackOrderController } from "../orders/order.controller.js";
import { validateCouponController } from "../coupons/coupon.controller.js";
import { getPublicCategoriesController } from "../categories/category.controller.js";
import {
  getPublicReviewsController,
  submitPublicReviewController,
} from "../reviews/review.controller.js";
import { InvoiceModel } from "../subscriptions/invoice.model.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

import {
  getPublicStoreTrackingController,
  publicLogStoreTrackingEventController,
} from "../stores/store-tracking.controller.js";

export const publicRouter: Router = Router();

publicRouter.get("/stores/:storeId/tracking", getPublicStoreTrackingController);
publicRouter.post("/stores/:storeId/tracking/events", publicLogStoreTrackingEventController);

// ─── Public: Verify employee by secure token ─────────────────────────────────
publicRouter.get("/employee/verify/:token", async (request, response: Response) => {
  const { verifyEmployeePublicController } = await import("../hrm/employee-id-card.controller.js");
  return verifyEmployeePublicController(request, response);
});

// ─── Public: Verify invoice by token (subscription or order) ────────────────
publicRouter.get("/invoice/verify/:token", async (request, response: Response) => {
  try {
    const token = request.params.token as string;
    if (!token) return sendFailure(response, "Token is required", 400);

    // Check subscription invoices first
    const subInvoice = await InvoiceModel.findOne({ verificationCode: token })
      .populate("planId", "name slug")
      .populate("storeId", "name slug subdomain")
      .populate("userId", "name email")
      .populate("approvedBy", "name")
      .lean();

    if (subInvoice) {
      return sendSuccess(response, {
        type: "subscription",
        invoice: subInvoice,
      });
    }

    // Check order invoices
    const orderDoc = await OrderModel.findOne({ verificationToken: token })
      .populate("customerId", "name email phone")
      .lean();
    const order = orderDoc as Record<string, unknown> | null;
    if (order) {
      const storeId = order.storeId as string | undefined;
      const store = (
        storeId
          ? await StoreModel.findById(storeId).select("name slug subdomain").lean()
          : null
      ) as { name?: string; slug?: string; subdomain?: string } | null;
      const shipment = order.shipment as Record<string, unknown> | undefined;
      return sendSuccess(response, {
        type: "order",
        invoice: {
          _id: order._id,
          invoiceNumber: order.invoiceNumber,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          currencyCode: order.currencyCode,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          deliveryCharge: order.deliveryCharge,
          tax: order.tax,
          taxRate: order.taxRate,
          total: order.total,
          refundAmount: order.refundAmount,
          notes: order.notes,
          courier: order.courier,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          shipment: shipment
            ? {
                provider: shipment.provider,
                providerName: shipment.providerName,
                consignmentId: shipment.consignmentId,
                trackingNumber: shipment.trackingNumber,
                status: shipment.status,
                environment: shipment.environment,
                estimatedDelivery: shipment.estimatedDelivery,
                createdAt: shipment.createdAt,
              }
            : null,
          storeId: store ? { name: store.name, slug: store.slug, subdomain: store.subdomain } : null,
          customerId: order.customerId,
          shippingAddress: order.shippingAddress,
          items: order.items,
          paymentVerification: order.paymentVerification,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          verificationToken: order.verificationToken,
        },
      });
    }

    return sendFailure(response, "Invoice not found or invalid verification token", 404);
  } catch (error) {
    console.error("[Public Invoice Verify Error]", error);
    return sendFailure(response, "Failed to verify invoice", 500);
  }
});

publicRouter.use(subdomainDetector);

publicRouter.get("/tenant", resolveTenantFromSubdomainController);
publicRouter.get("/tenant/:subdomain", resolveTenantBySlugController);
publicRouter.get("/tenant-by-host", resolveTenantByHostController);
publicRouter.get("/product/:slug", resolveProductByHostController);
publicRouter.get("/product/:storeSlug/:productSlug", resolveProductBySlugController);

publicRouter.get("/reviews", getPublicReviewsController);
publicRouter.post("/reviews", submitPublicReviewController);

publicRouter.get("/payment-methods", paymentMethodsController);
publicRouter.get("/stores/:storeId/payment-methods", paymentMethodsController);
publicRouter.get("/delivery-zones", deliveryZonesController);
publicRouter.get("/stores/:storeId/delivery-zones", deliveryZonesController);

publicRouter.use(resolveStoreFromSubdomain);
publicRouter.get("/tracking", getPublicStoreTrackingController);
publicRouter.post("/tracking/events", publicLogStoreTrackingEventController);
publicRouter.get("/products", getPublicProductsController);
publicRouter.get("/categories", getPublicCategoriesController);
publicRouter.get("/page/:slug", getPublicPageController);
publicRouter.get("/faqs", getPublicFaqsController);
publicRouter.get("/blog/posts", getPublicBlogPostsController);
publicRouter.get("/contact", getPublicStoreContactController);
publicRouter.post("/coupons/validate", validateCouponController);


