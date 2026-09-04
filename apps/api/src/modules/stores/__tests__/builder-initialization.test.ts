import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import dotenvFlow from "dotenv-flow";
import mongoose from "mongoose";

dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../.."), silent: true });
dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../../../"), silent: true });

import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { StorePageModel } from "../../pages/store-page.model.js";
import { PageModel } from "../../../models/page.model.js";
import {
  resolveCanonicalStoreId,
  ensureHomePage,
  ensureDefaultPages,
  listStorePages,
  getStorePageBySlug,
} from "../../pages/store-page.service.js";
import {
  getOrCreateHomePage,
  getPages as getBuilderPages,
} from "../../builder/builder.service.js";
import { hasPermission, roleToPermissions } from "../../../common/types/permissions.js";

describe("Store Builder Initialization & Resolution Test Suite", () => {
  let testStoreId: string;
  let testStoreSlug: string;

  before(async () => {
    await connectDatabase();

    const tenantId = new mongoose.Types.ObjectId();
    testStoreSlug = `test-builder-${Date.now()}`;

    const store = await StoreModel.create({
      tenantId,
      userId: new mongoose.Types.ObjectId(),
      name: "Builder Test Store",
      slug: testStoreSlug,
      subdomain: testStoreSlug,
      currency: "BDT",
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
      theme: {
        themeId: "grocery",
        primaryColor: "#00aa6c",
      },
    });
    testStoreId = String(store._id);
  });

  after(async () => {
    try {
      if (testStoreId) {
        await StoreModel.deleteOne({ _id: testStoreId });
        await StorePageModel.deleteMany({ storeId: testStoreId });
        await PageModel.deleteMany({ storeId: testStoreId });
      }
    } catch (e) {
      console.warn("Cleanup warning:", e);
    } finally {
      await mongoose.disconnect();
    }
  });

  it("resolves canonical store ID correctly from both ObjectId and slug", async () => {
    const resolvedFromId = await resolveCanonicalStoreId(testStoreId);
    assert.equal(resolvedFromId, testStoreId);

    const resolvedFromSlug = await resolveCanonicalStoreId(testStoreSlug);
    assert.equal(resolvedFromSlug, testStoreId);

    const resolvedFromUpperSlug = await resolveCanonicalStoreId(testStoreSlug.toUpperCase());
    assert.equal(resolvedFromUpperSlug, testStoreId);

    const nonExistent = await resolveCanonicalStoreId("non-existent-store-slug-9999");
    assert.equal(nonExistent, null);
  });

  it("gracefully initializes/seeds home page with default sections when accessed via slug", async () => {
    // Call ensureHomePage with slug
    const home = await ensureHomePage(testStoreSlug);
    assert.ok(home, "Home page should be created");
    assert.equal(String(home.storeId), testStoreId);
    assert.equal(home.isHomePage, true);
    assert.equal(home.slug, "/");
    assert.ok(Array.isArray(home.sections) && home.sections.length > 0, "Default sections must be seeded");

    // Call again to verify idempotency (preserves existing)
    const homeSecondCall = await ensureHomePage(testStoreSlug);
    assert.equal(String(homeSecondCall?._id), String(home._id));
  });

  it("lists store pages cleanly with store slug or ObjectId", async () => {
    const pagesFromSlug = await listStorePages(testStoreSlug);
    const pagesFromId = await listStorePages(testStoreId);

    assert.ok(pagesFromSlug.ok && pagesFromSlug.data.pages.length >= 1);
    assert.ok(pagesFromId.ok && pagesFromId.data.pages.length >= 1);
    assert.equal(pagesFromSlug.data.pages.length, pagesFromId.data.pages.length);
    assert.equal(String(pagesFromSlug.data.pages[0]._id), String(pagesFromId.data.pages[0]._id));
  });

  it("resolves store page by slug ('/' and 'home')", async () => {
    const pageByRoot = await getStorePageBySlug(testStoreSlug, "/");
    assert.ok(pageByRoot.ok && pageByRoot.data.page, "Page '/' should resolve");

    const pageByHome = await getStorePageBySlug(testStoreSlug, "home");
    assert.ok(pageByHome.ok && pageByHome.data.page, "Page 'home' should resolve to home page");
    assert.equal(String((pageByRoot.data.page as any)?._id), String((pageByHome.data.page as any)?._id));
  });

  it("builder service getOrCreateHomePage functions seamlessly with store slug", async () => {
    const result = await getOrCreateHomePage(testStoreSlug);
    assert.equal(result.ok, true);
    assert.ok(result.data.page);
    assert.ok(result.data.page.sections.length > 0);
  });

  it("grants builder permissions correctly to admin and owner roles", () => {
    const adminPermissions = roleToPermissions("admin");
    const managerPermissions = roleToPermissions("manager");
    const staffPermissions = roleToPermissions("staff");

    assert.ok(hasPermission(adminPermissions, "builder:read" as any));
    assert.ok(hasPermission(adminPermissions, "builder:update" as any));
    assert.ok(hasPermission(adminPermissions, "builder:manage" as any));

    assert.ok(hasPermission(managerPermissions, "builder:read" as any));
    assert.ok(hasPermission(managerPermissions, "builder:update" as any));

    assert.equal(hasPermission(staffPermissions, "builder:manage" as any), false);
  });
});
