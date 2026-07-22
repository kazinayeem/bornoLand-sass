import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { StoreContactModel } from "../stores/store-contact.model.js";
import { CustomerModel } from "../customers/customer.model.js";
import { resolveStoreBrandingLogoBuffer } from "../stores/store-branding-logo.js";
import { generateOrderInvoicePdf } from "./order-invoice-pdf.service.js";

// Ensure Customer schema is registered for order.populate("customerId")
void CustomerModel;

function generateInvoiceNumber(prefix: string): string {
  const cleanPrefix = (prefix || "INV").trim().replace(/[^A-Za-z0-9_-]/g, "").toUpperCase() || "INV";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanPrefix}-${ts}-${rand}`;
}

function buildStoreWebsite(store: {
  subdomain?: string;
  slug?: string;
}): string {
  const host =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    "localhost:3000";
  const subdomain = store.subdomain?.trim() || store.slug?.trim();
  if (!subdomain) return "";
  if (host.includes("localhost")) {
    const port = host.includes(":") ? host.split(":")[1] : "3000";
    return `http://${subdomain}.localhost:${port}`;
  }
  return `https://${subdomain}.${host.replace(/^www\./, "")}`;
}

export async function generateOrderInvoice(params: {
  storeId: string;
  orderId: string;
  customerId?: string;
  verificationUrl?: string;
}) {
  try {
    await connectDatabase();

    // Appearance → Branding is the single source of truth for invoice logos.
    const store = (await StoreModel.findOne({ _id: params.storeId })
      .select(
        "name shortName slug subdomain logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor theme",
      )
      .lean()) as {
      _id: unknown;
      name?: string;
      shortName?: string;
      slug?: string;
      subdomain?: string;
      logoUrl?: string;
      logoMediaId?: unknown;
      faviconUrl?: string;
      faviconMediaId?: unknown;
      brandColor?: string;
      accentColor?: string;
      theme?: { primaryColor?: string };
    } | null;
    if (!store) {
      return { ok: false as const, message: "Store not found" };
    }

    const orderQuery: Record<string, unknown> = {
      _id: params.orderId,
      storeId: params.storeId,
    };
    if (params.customerId) orderQuery.customerId = params.customerId;

    const order = await OrderModel.findOne(orderQuery).populate(
      "customerId",
      "_id name email phone",
    );
    if (!order) {
      return { ok: false as const, message: "Order not found" };
    }

    const [storeContact, storeSettings, brandingLogo] = await Promise.all([
      StoreContactModel.findOne({ storeId: params.storeId }).lean(),
      StoreSettingsModel.findOne({ storeId: params.storeId }).lean() as Promise<{
        invoicePrefix?: string;
      } | null>,
      resolveStoreBrandingLogoBuffer({
        logoUrl: store.logoUrl,
        logoMediaId: store.logoMediaId,
        faviconUrl: store.faviconUrl,
        faviconMediaId: store.faviconMediaId,
      }),
    ]);

    if (!order.invoiceNumber) {
      order.invoiceNumber = generateInvoiceNumber(storeSettings?.invoicePrefix ?? "INV");
    }
    if (!order.verificationToken) {
      order.verificationToken = crypto.randomBytes(16).toString("hex");
    }
    await order.save();

    if (!brandingLogo.buffer) {
      console.warn("[orders] Store branding logo unresolved; invoice will use initials", {
        storeId: params.storeId,
        logoUrl: store.logoUrl,
        logoMediaId: store.logoMediaId ? String(store.logoMediaId) : null,
        faviconUrl: store.faviconUrl,
      });
    }

    const orderObject = order.toObject() as Record<string, unknown>;
    if (orderObject.customerId && typeof orderObject.customerId === "object") {
      const customer = orderObject.customerId as Record<string, unknown>;
      orderObject.customerId = {
        ...customer,
        _id: String(customer._id ?? ""),
      };
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const verificationUrl = `${appUrl}/invoice/verify/${order.verificationToken}`;

    const buffer = await generateOrderInvoicePdf({
      order: orderObject as never,
      store: {
        name: store.name,
        shortName: store.shortName,
        slug: store.slug,
        subdomain: store.subdomain,
        logoUrl: store.logoUrl,
        faviconUrl: store.faviconUrl,
        brandColor: store.brandColor,
        theme: store.theme,
        websiteUrl: buildStoreWebsite(store),
      },
      storeContact: storeContact as never,
      storeSettings: storeSettings as never,
      storeLogoBuffer: brandingLogo.buffer,
      verificationUrl,
    });

    return {
      ok: true as const,
      buffer,
      filename: `invoice-${order.invoiceNumber}.pdf`,
      order: order.toObject(),
      verificationToken: order.verificationToken,
    };
  } catch (error) {
    console.error("[orders] Failed to generate order invoice", error);
    return { ok: false as const, message: "Failed to generate invoice PDF" };
  }
}
