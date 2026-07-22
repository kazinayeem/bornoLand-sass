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
import { InvoiceModel } from "../subscriptions/invoice.model.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const publicRouter: Router = Router();

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
    const order = await OrderModel.findOne({ verificationToken: token }).lean();
    if (order) {
      const store = order.storeId
        ? await StoreModel.findById(order.storeId).select("name slug subdomain").lean()
        : null;
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
          total: order.total,
          refundAmount: order.refundAmount,
          storeId: store ? { name: store.name, slug: store.slug, subdomain: store.subdomain } : null,
          customerId: order.customerId,
          shippingAddress: order.shippingAddress,
          items: order.items,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          paidAt: order.paidAt,
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

publicRouter.use(resolveStoreFromSubdomain);
publicRouter.get("/products", getPublicProductsController);
publicRouter.get("/page/:slug", getPublicPageController);
publicRouter.get("/faqs", getPublicFaqsController);
publicRouter.get("/blog/posts", getPublicBlogPostsController);
publicRouter.get("/contact", getPublicStoreContactController);
publicRouter.get("/payment-methods", paymentMethodsController);
publicRouter.get("/delivery-zones", deliveryZonesController);
publicRouter.get("/order-track", trackOrderController);
