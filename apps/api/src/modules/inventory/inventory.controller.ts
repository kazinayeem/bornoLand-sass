import type { Request, Response } from "express";
import {
  getInventoryList,
  getInventoryStats,
  adjustStock,
  getStockHistory,
  getInventoryAnalytics,
  bulkUpdateInventory,
  bulkArchiveProducts,
  bulkDeleteProducts,
} from "./inventory.service.js";

export async function getInventoryController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const page = Number(request.query.page) || 1;
    const perPage = Number(request.query.perPage) || 25;
    const search = String(request.query.search || "");
    const sortField = String(request.query.sortField || "updatedAt");
    const sortOrder = String(request.query.sortOrder || "desc") as "asc" | "desc";
    const status = String(request.query.status || "");
    const stockStatus = String(request.query.stockStatus || "") as any;
    const productType = String(request.query.productType || "");
    const category = String(request.query.category || "");
    const brand = String(request.query.brand || "");
    const vendor = String(request.query.vendor || "");
    const createdAfter = String(request.query.createdAfter || "");
    const createdBefore = String(request.query.createdBefore || "");

    const result = await getInventoryList(storeId, {
      page,
      perPage,
      search,
      sort: { field: sortField, order: sortOrder },
      filter: {
        ...(status ? { status } : {}),
        ...(stockStatus ? { stockStatus } : {}),
        ...(productType ? { productType } : {}),
        ...(category ? { category } : {}),
        ...(brand ? { brand } : {}),
        ...(vendor ? { vendor } : {}),
        ...(createdAfter ? { createdAfter } : {}),
        ...(createdBefore ? { createdBefore } : {}),
      },
    });

    response.json({ ok: true, data: result });
  } catch (error) {
    console.error("[Inventory] list error:", error);
    response.status(500).json({ ok: false, message: "Failed to load inventory" });
  }
}

export async function getInventoryStatsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const stats = await getInventoryStats(storeId);
    response.json({ ok: true, data: stats });
  } catch (error) {
    console.error("[Inventory] stats error:", error);
    response.status(500).json({ ok: false, message: "Failed to load inventory stats" });
  }
}

export async function adjustStockController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    const productId = String(request.params.productId ?? "");
    if (!storeId || !productId) {
      response.status(400).json({ ok: false, message: "storeId and productId are required" });
      return;
    }

    const { quantity, variantId, reason, note } = request.body as { quantity: number; variantId?: string; reason?: string; note?: string };
    if (quantity === undefined || quantity === null) {
      response.status(400).json({ ok: false, message: "quantity is required" });
      return;
    }

    const result = await adjustStock(storeId, productId, {
      quantity: Number(quantity),
      variantId,
      reason,
      note,
    });

    response.json(result);
  } catch (error) {
    console.error("[Inventory] adjust stock error:", error);
    response.status(500).json({ ok: false, message: "Failed to adjust stock" });
  }
}

export async function getStockHistoryController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const productId = String(request.query.productId || "");
    const variantId = String(request.query.variantId || "");
    const page = Number(request.query.page) || 1;
    const perPage = Number(request.query.perPage) || 25;

    const result = await getStockHistory(storeId, {
      productId: productId || undefined,
      variantId: variantId || undefined,
      page,
      perPage,
    });

    response.json({ ok: true, data: result });
  } catch (error) {
    console.error("[Inventory] history error:", error);
    response.status(500).json({ ok: false, message: "Failed to load stock history" });
  }
}

export async function getInventoryAnalyticsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const analytics = await getInventoryAnalytics(storeId);
    response.json({ ok: true, data: analytics });
  } catch (error) {
    console.error("[Inventory] analytics error:", error);
    response.status(500).json({ ok: false, message: "Failed to load inventory analytics" });
  }
}

export async function bulkUpdateController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const { operations } = request.body as { operations: Array<{ productId: string; variantId?: string; stock?: number; adjustment?: number; reason?: string; note?: string }> };
    if (!operations?.length) {
      response.status(400).json({ ok: false, message: "operations array is required" });
      return;
    }

    const results = await bulkUpdateInventory(storeId, operations);
    response.json({ ok: true, data: { results, count: results.length } });
  } catch (error) {
    console.error("[Inventory] bulk update error:", error);
    response.status(500).json({ ok: false, message: "Failed to bulk update inventory" });
  }
}

export async function bulkArchiveController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const { productIds } = request.body as { productIds: string[] };
    if (!productIds?.length) {
      response.status(400).json({ ok: false, message: "productIds array is required" });
      return;
    }

    const result = await bulkArchiveProducts(storeId, productIds);
    response.json({ ok: true, data: result });
  } catch (error) {
    console.error("[Inventory] bulk archive error:", error);
    response.status(500).json({ ok: false, message: "Failed to archive products" });
  }
}

export async function bulkDeleteController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const { productIds } = request.body as { productIds: string[] };
    if (!productIds?.length) {
      response.status(400).json({ ok: false, message: "productIds array is required" });
      return;
    }

    const result = await bulkDeleteProducts(storeId, productIds);
    response.json({ ok: true, data: result });
  } catch (error) {
    console.error("[Inventory] bulk delete error:", error);
    response.status(500).json({ ok: false, message: "Failed to delete products" });
  }
}
