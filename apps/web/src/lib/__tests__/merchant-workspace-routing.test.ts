import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePostLoginDestination, type AuthPayload } from "@/lib/auth-redirect-client";
import { isPlatformRoute, PLATFORM_ROUTES } from "@/lib/tenant-resolution";
import { classifyHost, type HostResolutionConfig } from "@/lib/host-resolution";

describe("Merchant Login & Workspace Routing Architecture Tests", () => {
  const prodConfig: HostResolutionConfig = {
    rootDomain: "bornosoft.site",
    rootHostname: "bornosoft.site",
    platformBases: [],
  };

  it("TEST 1: Platform route classification correctly identifies /workshops as PLATFORM route", () => {
    assert.equal(isPlatformRoute("/workshops"), true);
    assert.equal(isPlatformRoute("/workshops/create"), true);
    assert.equal(PLATFORM_ROUTES.has("/workshops"), true);
  });

  it("TEST 2: Super Admin login always routes to /dashboard", () => {
    const payload: AuthPayload = {
      user: {
        id: "super-1",
        role: "super_admin",
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/dashboard");
  });

  it("TEST 3: Demo Merchant with single store routes directly to /store/{slug}/dashboard", () => {
    const payload: AuthPayload = {
      user: {
        id: "demo-merchant",
        role: "owner",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "store-1", slug: "demo-store", name: "Demo Store" }],
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/store/demo-store/dashboard");
  });

  it("TEST 4: Merchant with multiple stores routes to /workshops", () => {
    const payload: AuthPayload = {
      user: {
        id: "merchant-multi",
        role: "admin",
        stores: [
          { id: "store-1", slug: "store-a", name: "Store A" },
          { id: "store-2", slug: "store-b", name: "Store B" },
          { id: "store-3", slug: "store-c", name: "Store C" },
        ],
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/workshops");
  });

  it("TEST 5: Merchant with 0 stores routes to /dashboard/stores/create", () => {
    const payload: AuthPayload = {
      user: {
        id: "merchant-new",
        role: "owner",
        stores: [],
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/dashboard/stores/create");
  });

  it("TEST 6: Employee login routes to HRM self-service workspace", () => {
    const payload: AuthPayload = {
      user: {
        id: "employee-1",
        role: "employee",
        defaultStoreSlug: "nayeem-fashion",
        stores: [],
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/store/nayeem-fashion/hrm/self-service");
  });

  it("TEST 7: Staff with assigned landing path routes to permitted module", () => {
    const payload: AuthPayload = {
      user: {
        id: "staff-1",
        role: "staff",
        defaultStoreSlug: "nayeem-store",
        defaultLandingPath: "/store/nayeem-store/pos",
        stores: [{ id: "store-1", slug: "nayeem-store", name: "Nayeem Store" }],
      },
    };
    const destination = resolvePostLoginDestination(payload);
    assert.equal(destination, "/store/nayeem-store/pos");
  });

  it("TEST 8: Tenant host resolution distinguishes bornosoft.site vs nayeem.bornosoft.site", () => {
    const apex = classifyHost("bornosoft.site", prodConfig);
    assert.equal(apex.kind, "platform");
    assert.equal(apex.storeKey, null);

    const tenant = classifyHost("nayeem.bornosoft.site", prodConfig);
    assert.equal(tenant.kind, "tenant-subdomain");
    assert.equal(tenant.storeKey, "nayeem");
  });

  it("TEST 9: Non-authorized employee cannot redirect to /workshops or /dashboard", () => {
    const payload: AuthPayload = {
      user: {
        id: "employee-1",
        role: "employee",
        defaultStoreSlug: "store-1",
      },
    };
    const destinationWithWorkshops = resolvePostLoginDestination(payload, "/workshops");
    assert.equal(destinationWithWorkshops, "/store/store-1/hrm/self-service");

    const destinationWithDashboard = resolvePostLoginDestination(payload, "/dashboard");
    assert.equal(destinationWithDashboard, "/store/store-1/hrm/self-service");
  });

  it("TEST 10: Merchant cannot redirect to Super Admin /dashboard or /admin/*", () => {
    const payload: AuthPayload = {
      user: {
        id: "merchant-1",
        role: "admin",
        defaultStoreSlug: "my-shop",
        stores: [{ id: "1", slug: "my-shop", name: "My Shop" }],
      },
    };
    const destinationAdmin = resolvePostLoginDestination(payload, "/admin/dashboard");
    assert.equal(destinationAdmin, "/store/my-shop/dashboard");

    const destinationPlatformDashboard = resolvePostLoginDestination(payload, "/dashboard");
    assert.equal(destinationPlatformDashboard, "/store/my-shop/dashboard");
  });

  it("TEST 11: Tenant host nayeem.bornosoft.site on path '/' stays on tenant and is NOT a platform management route", () => {
    const { isPlatformManagementRoute } = require("@/lib/tenant-resolution");
    const tenantClassification = classifyHost("nayeem.bornosoft.site", prodConfig);
    assert.equal(tenantClassification.storeKey, "nayeem");
    assert.equal(tenantClassification.kind, "tenant-subdomain");

    // Root path '/' is storefront homepage, NOT platform management
    assert.equal(isPlatformManagementRoute("/"), false);
  });

  it("TEST 12: Storefront routes on tenant subdomain are never classified as platform management routes", () => {
    const { isPlatformManagementRoute } = require("@/lib/tenant-resolution");
    const storefrontPaths = [
      "/",
      "/shop",
      "/products",
      "/products/t-shirt",
      "/categories",
      "/cart",
      "/checkout",
      "/about",
      "/contact",
      "/faq",
      "/terms",
      "/privacy",
      "/blog",
      "/order-tracking",
      "/wishlist",
      "/account/login",
      "/account/orders",
    ];

    for (const path of storefrontPaths) {
      assert.equal(
        isPlatformManagementRoute(path),
        false,
        `Path ${path} must not be a platform management route so it does not redirect to platform apex!`
      );
    }
  });
});
