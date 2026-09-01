import { createRequire } from "node:module";
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const serverOnlyPath = require.resolve("server-only");
(require.cache as any)[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
  children: [],
  paths: [],
  path: "",
  isPreloading: false,
  require,
};

let resolveStoreFavicon: any;
let resolveStoreOgImage: any;
let generateTenantLayoutMetadata: any;
let generateTenantMetadata: any;
let generateStorefrontProductMetadata: any;

describe("Tenant Metadata & Favicon Architecture", () => {
  before(async () => {
    const mod = await import("../page-metadata.js");
    resolveStoreFavicon = mod.resolveStoreFavicon;
    resolveStoreOgImage = mod.resolveStoreOgImage;
    generateTenantLayoutMetadata = mod.generateTenantLayoutMetadata;
    generateTenantMetadata = mod.generateTenantMetadata;
    generateStorefrontProductMetadata = mod.generateStorefrontProductMetadata;
  });

  it("Test 1: Resolves valid store favicon from faviconUrl or logoUrl", () => {
    const storeWithFavicon = {
      faviconUrl: "/uploads/stores/nayeem/branding/favicon.png",
      logoUrl: "/uploads/stores/nayeem/branding/logo.png",
    };
    assert.equal(
      resolveStoreFavicon(storeWithFavicon),
      "/api/uploads/stores/nayeem/branding/favicon.png",
    );

    const storeWithLogoOnly = {
      logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    };
    assert.equal(
      resolveStoreFavicon(storeWithLogoOnly),
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    );
  });

  it("Test 2: Safely falls back to default icon when store has no logo or favicon", () => {
    assert.equal(resolveStoreFavicon(null), "/logo.png");
    assert.equal(resolveStoreFavicon({}), "/logo.png");
    assert.equal(resolveStoreFavicon({ faviconUrl: "", logoUrl: "  " }), "/logo.png");
  });

  it("Test 3: Resolves Open Graph and Twitter images safely", () => {
    assert.equal(
      resolveStoreOgImage("/uploads/products/tea.png", { logoUrl: "/uploads/logo.png" }),
      "/api/uploads/products/tea.png",
    );
    assert.equal(
      resolveStoreOgImage(null, { logoUrl: "/uploads/logo.png" }),
      "/api/uploads/logo.png",
    );
    assert.equal(resolveStoreOgImage(null, {}), undefined);
  });

  it("Test 4: Generates tenant layout metadata with title template and dynamic icons", async () => {
    const meta = await generateTenantLayoutMetadata("nayeem");
    assert.ok(meta);
    assert.ok(meta.icons);
    assert.ok(Array.isArray((meta.icons as any).icon));
    assert.ok(Array.isArray((meta.icons as any).shortcut));
    assert.ok(Array.isArray((meta.icons as any).apple));

    const iconUrl = (meta.icons as any).icon[0].url;
    assert.ok(iconUrl && !iconUrl.includes("undefined"));
    assert.ok(meta.openGraph?.siteName);
    assert.ok(meta.openGraph?.siteName !== "BornoLand");
  });

  it("Test 5: Generates customer page title formatted with store name", async () => {
    const checkoutMeta = await generateTenantMetadata({
      tenant: "nayeem",
      pageTitle: "Checkout",
      canonicalPath: "/site/nayeem/checkout",
    });
    assert.ok(typeof checkoutMeta.title === "object" && "absolute" in checkoutMeta.title!);
    assert.match((checkoutMeta.title as any).absolute, /^Checkout \| /);

    const homeMeta = await generateTenantMetadata({
      tenant: "nayeem",
      pageTitle: "Home",
      canonicalPath: "/site/nayeem",
    });
    assert.ok(typeof homeMeta.title === "object" && "absolute" in homeMeta.title!);
    assert.doesNotMatch((homeMeta.title as any).absolute, /^Home \| /);
  });

  it("Test 6: Generates product metadata with product name, store name, and product image", async () => {
    const productMeta = await generateStorefrontProductMetadata({
      tenant: "nayeem",
      product: {
        name: "Premium Mustard Oil 1L",
        description: "Cold pressed pure mustard oil",
        price: 320,
        slug: "premium-mustard-oil-1l",
        imageUrl: "/uploads/products/oil.jpg",
      },
    });

    assert.ok(typeof productMeta.title === "object" && "absolute" in productMeta.title!);
    assert.match((productMeta.title as any).absolute, /^Premium Mustard Oil 1L \| /);
    assert.equal(productMeta.description, "Cold pressed pure mustard oil");
    assert.ok((productMeta.openGraph as any)?.images?.[0]?.url?.includes("oil.jpg"));
  });
});
