import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { TenantModel } from "../../../models/tenant.model.js";
import { StorePageModel } from "../../pages/store-page.model.js";
import { ProductModel } from "../../../models/product.model.js";
import { CategoryModel } from "../../../models/category.model.js";
import { StoreSettingsModel } from "../../../models/store-settings.model.js";
import { HomepageSliderModel } from "../../../models/homepage-slider.model.js";
import { NavigationModel } from "../../navigation/navigation.model.js";
import { MenuItemModel } from "../../navigation/menu-item.model.js";
import { findStoreByHostKey, resolveBySubdomain } from "../tenant-resolver.service.js";

describe("Tenant Resolver Performance & Isolation Test Suite", () => {
  let tenantAId: mongoose.Types.ObjectId;
  let tenantBId: mongoose.Types.ObjectId;
  let storeAId: string;
  let storeBId: string;
  let storeASlug: string;
  let storeBSlug: string;

  before(async () => {
    await connectDatabase();

    tenantAId = new mongoose.Types.ObjectId();
    tenantBId = new mongoose.Types.ObjectId();
    storeASlug = `perf-a-${Date.now()}`;
    storeBSlug = `perf-b-${Date.now()}`;

    // Create Tenant records
    await TenantModel.create([
      { _id: tenantAId, name: "Tenant A", slug: storeASlug, status: "active" },
      { _id: tenantBId, name: "Tenant B", slug: storeBSlug, status: "active" },
    ]);

    // Create Stores
    const [storeA, storeB] = await Promise.all([
      StoreModel.create({
        tenantId: tenantAId,
        userId: new mongoose.Types.ObjectId(),
        name: "Store Alpha Performance",
        slug: storeASlug,
        subdomain: storeASlug,
        customDomains: [`custom-${storeASlug}.com`],
        status: "active",
        billingStatus: "active",
        subscriptionStatus: "active",
      }),
      StoreModel.create({
        tenantId: tenantBId,
        userId: new mongoose.Types.ObjectId(),
        name: "Store Beta Performance",
        slug: storeBSlug,
        subdomain: storeBSlug,
        status: "active",
        billingStatus: "active",
        subscriptionStatus: "active",
      }),
    ]);

    storeAId = String(storeA._id);
    storeBId = String(storeB._id);

    // Populate Store A data
    await Promise.all([
      StorePageModel.create({
        storeId: storeA._id,
        tenantId: tenantAId,
        title: "Home",
        slug: "/",
        status: "published",
        sections: [{ id: "hero-1", type: "hero-banner" }],
      }),
      ProductModel.create([
        {
          storeId: storeA._id,
          name: "Alpha Product 1",
          slug: "alpha-product-1",
          price: 100,
          status: "active",
        },
        {
          storeId: storeA._id,
          name: "Alpha Product 2",
          slug: "alpha-product-2",
          price: 200,
          status: "active",
        },
      ]),
      CategoryModel.create([
        {
          storeId: storeA._id,
          name: "Alpha Category 1",
          slug: "alpha-cat-1",
          active: true,
        },
      ]),
      StoreSettingsModel.create({
        storeId: storeA._id,
        currencyCode: "BDT",
        currencySymbol: "৳",
      }),
      HomepageSliderModel.create({
        storeId: storeA._id,
        title: "Alpha Banner",
        imageUrl: "https://example.com/banner-a.jpg",
        isActive: true,
      }),
    ]);

    // Create Navigations and Menu Items for Store A
    const nav1 = await NavigationModel.create({
      storeId: storeA._id,
      tenantId: tenantAId,
      key: "primary",
      label: "Header Navigation",
      isActive: true,
    });
    const nav2 = await NavigationModel.create({
      storeId: storeA._id,
      tenantId: tenantAId,
      key: "footer",
      label: "Footer Navigation",
      isActive: true,
    });

    await MenuItemModel.create([
      { navigationId: nav1._id, storeId: storeA._id, title: "Home", link: "/", isVisible: true, sortOrder: 0 },
      { navigationId: nav1._id, storeId: storeA._id, title: "Shop", link: "/shop", isVisible: true, sortOrder: 1 },
      { navigationId: nav2._id, storeId: storeA._id, title: "Privacy", link: "/privacy", isVisible: true, sortOrder: 0 },
    ]);

    // Populate Store B data with distinct values
    await Promise.all([
      StorePageModel.create({
        storeId: storeB._id,
        tenantId: tenantBId,
        title: "Beta Home",
        slug: "/",
        status: "published",
        sections: [{ id: "hero-beta", type: "hero-banner-beta" }],
      }),
      ProductModel.create({
        storeId: storeB._id,
        name: "Beta Product Only",
        slug: "beta-product-only",
        price: 999,
        status: "active",
      }),
    ]);
  });

  after(async () => {
    try {
      if (storeAId) {
        await StoreModel.deleteOne({ _id: storeAId });
        await TenantModel.deleteOne({ _id: tenantAId });
        await StorePageModel.deleteMany({ storeId: storeAId });
        await ProductModel.deleteMany({ storeId: storeAId });
        await CategoryModel.deleteMany({ storeId: storeAId });
        await StoreSettingsModel.deleteOne({ storeId: storeAId });
        await HomepageSliderModel.deleteMany({ storeId: storeAId });
        await NavigationModel.deleteMany({ storeId: storeAId });
        await MenuItemModel.deleteMany({ storeId: storeAId });
      }
      if (storeBId) {
        await StoreModel.deleteOne({ _id: storeBId });
        await TenantModel.deleteOne({ _id: tenantBId });
        await StorePageModel.deleteMany({ storeId: storeBId });
        await ProductModel.deleteMany({ storeId: storeBId });
      }
    } catch {
      // Cleanup best effort
    }
  });

  it("Test 1: findStoreByHostKey resolves store by slug, subdomain, and customDomain", async () => {
    const bySlug = await findStoreByHostKey(storeASlug);
    assert.ok(bySlug, "Should resolve store by slug");
    assert.equal(String(bySlug!._id), storeAId);

    const bySubdomain = await findStoreByHostKey(storeASlug);
    assert.ok(bySubdomain, "Should resolve store by subdomain");
    assert.equal(String(bySubdomain!._id), storeAId);

    const byCustomDomain = await findStoreByHostKey(`custom-${storeASlug}.com`);
    assert.ok(byCustomDomain, "Should resolve store by custom domain");
    assert.equal(String(byCustomDomain!._id), storeAId);
  });

  it("Test 2: resolveBySubdomain resolves complete storefront payload in parallel", async () => {
    const start = performance.now();
    const result = await resolveBySubdomain(storeASlug, "home");
    const duration = performance.now() - start;

    assert.ok(result.ok, "Resolution must succeed");
    assert.ok(result.data, "Payload must be defined");
    assert.equal(String(result.data.store?._id), storeAId);
    assert.equal(String(result.data.tenant?._id), String(tenantAId));
    assert.ok(result.data.page, "Page must be loaded");
    assert.equal(result.data.products.length, 2, "Products must be returned");
    assert.equal(result.data.categories.length, 1, "Categories must be returned");
    assert.equal(result.data.sliders.length, 1, "Sliders must be returned");
    assert.equal(result.data.navigations?.length, 2, "Both navigations must be returned");

    // Verify batched menu item trees
    const primaryNav = result.data.navigations?.find((n: any) => n.key === "primary") as any;
    assert.ok(primaryNav, "Primary navigation must exist");
    assert.equal(primaryNav.items?.length, 2, "Primary nav items must be assembled into tree");
    assert.equal(primaryNav.items[0].title, "Home");
    assert.equal(primaryNav.items[1].title, "Shop");

    const footerNav = result.data.navigations?.find((n: any) => n.key === "footer") as any;
    assert.ok(footerNav, "Footer navigation must exist");
    assert.equal(footerNav.items?.length, 1, "Footer nav items must be assembled into tree");

    console.log(`    ℹ Parallelized resolution cold duration: ${duration.toFixed(2)}ms`);
  });

  it("Test 3: Warm resolution utilizes cache for ultra-fast response", async () => {
    // Second request is cached
    const start = performance.now();
    const result = await resolveBySubdomain(storeASlug, "home");
    const duration = performance.now() - start;

    assert.ok(result.ok, "Warm request must succeed");
    assert.ok(duration < 20, `Warm request should be sub-20ms (was ${duration.toFixed(2)}ms)`);
    console.log(`    ℹ Warm cached resolution duration: ${duration.toFixed(2)}ms`);
  });

  it("Test 4: Unknown tenant subdomain returns 404/not-found result safely without leakage", async () => {
    const result = await resolveBySubdomain("non-existent-tenant-xyz-99999", "home");
    assert.equal(result.ok, false);
    assert.equal(result.message, "Store not found");
    assert.equal(result.data, undefined);
  });

  it("Test 5: Cross-Tenant Data Isolation — Store A and Store B never leak data or cache", async () => {
    const resultA = await resolveBySubdomain(storeASlug, "home");
    const resultB = await resolveBySubdomain(storeBSlug, "home");

    assert.ok(resultA.ok);
    assert.ok(resultB.ok);

    // Verify store identities
    assert.equal(String(resultA.data?.store?._id), storeAId);
    assert.equal(String(resultB.data?.store?._id), storeBId);

    // Verify product isolation
    const productNamesA = (resultA.data?.products || []).map((p: any) => p.name);
    const productNamesB = (resultB.data?.products || []).map((p: any) => p.name);

    assert.ok(productNamesA.includes("Alpha Product 1"));
    assert.ok(!productNamesA.includes("Beta Product Only"), "Store A must not contain Store B products");

    assert.ok(productNamesB.includes("Beta Product Only"));
    assert.ok(!productNamesB.includes("Alpha Product 1"), "Store B must not contain Store A products");
  });
});
