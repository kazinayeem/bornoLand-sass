import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  trackCheckoutProgress,
  getIncompleteCheckouts,
  getIncompleteCheckoutById,
  recoverCheckoutByToken,
  generateRecoveryLink,
  verifyStoreAccess,
  isIncompleteOrdersAllowed,
} from "./incomplete-checkout.service.js";
import {
  trackCheckoutProgressSchema,
  queryIncompleteCheckoutsSchema,
} from "./incomplete-checkout.validator.js";

/**
 * Public storefront controller for progressive autosave of checkout data.
 */
export async function trackCheckoutProgressController(req: Request, res: Response) {
  try {
    const storeId = String(req.params.storeId || req.body.storeId || "");
    if (!storeId) {
      return res.status(400).json({ success: false, message: "storeId is required" });
    }

    const parsed = trackCheckoutProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkout payload",
        errors: parsed.error.format(),
      });
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const result = await trackCheckoutProgress(storeId, parsed.data, {
      ipAddress,
      userAgent,
    });

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      message: "Checkout progress tracked",
      data: result.data,
    });
  } catch (error) {
    console.error("[incomplete-checkout] Tracking controller error:", error);
    return res.status(500).json({ success: false, message: "Failed to track checkout progress" });
  }
}

/**
 * Shop owner controller to retrieve paginated list and statistics of incomplete checkouts.
 */
export async function getIncompleteCheckoutsController(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const storeId = String(req.params.storeId || req.params.id || "");
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!storeId) {
      return res.status(400).json({ success: false, message: "storeId is required" });
    }

    const hasAccess = await verifyStoreAccess(storeId, userId!, userRole);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Access denied to this store" });
    }

    const parsedQuery = queryIncompleteCheckoutsSchema.safeParse(req.query);
    const query = parsedQuery.success ? parsedQuery.data : {};

    const result = await getIncompleteCheckouts(storeId, query);

    return res.json({
      success: true,
      entitlement: result.entitlement,
      data: result.data,
    });
  } catch (error) {
    console.error("[incomplete-checkout] Get list controller error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch incomplete checkouts" });
  }
}

/**
 * Shop owner controller to retrieve full details for a single incomplete checkout.
 */
export async function getIncompleteCheckoutByIdController(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const storeId = String(req.params.storeId || req.params.id || "");
    const checkoutId = String(req.params.checkoutId || req.params.id || "");
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    const hasAccess = await verifyStoreAccess(storeId, userId!, userRole);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await getIncompleteCheckoutById(storeId, checkoutId);
    if (!result.ok) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[incomplete-checkout] Get detail controller error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch checkout details" });
  }
}

/**
 * Shop owner controller to generate or retrieve a recovery URL.
 */
export async function generateRecoveryLinkController(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const storeId = String(req.params.storeId || "");
    const checkoutId = String(req.params.checkoutId || "");
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    const hasAccess = await verifyStoreAccess(storeId, userId!, userRole);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await generateRecoveryLink(storeId, checkoutId);
    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[incomplete-checkout] Generate link error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate recovery link" });
  }
}

/**
 * Public controller to validate recovery token and hydrate checkout for customer.
 */
export async function recoverCheckoutByTokenController(req: Request, res: Response) {
  try {
    const token = String(req.params.token || req.query.token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Recovery token is required" });
    }

    const result = await recoverCheckoutByToken(token);
    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.message,
        isConverted: (result as any).isConverted,
        convertedOrderId: (result as any).convertedOrderId,
      });
    }

    return res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[incomplete-checkout] Recover by token error:", error);
    return res.status(500).json({ success: false, message: "Failed to recover checkout" });
  }
}
