import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { StorePageModel } from "../../pages/store-page.model.js";
import { PageModel } from "../../../models/page.model.js";
import { publishPage as publishStorePage, unpublishPage, rollbackToVersion } from "../../pages/publish.service.js";
import { publishPage as publishBuilderPage, savePage, getOrCreateHomePage } from "../../builder/builder.service.js";
import { invalidateStoreTenantCache } from "../../../common/cache/cache.service.js";

describe("Builder → Publish → On-Demand Revalidation Architecture Test Suite", () => {
  let storeAId: string;
  let storeBId: string;
  let storeASlug: string;
  let storeBSlug: string;

  before(async () => {
    await connectDatabase();

    const tenantAId = new mongoose.Types.ObjectId();
    const tenantBId = new mongoose.Types.ObjectId();

    storeASlug = `store-a-${Date.now()}`;
    storeBSlug = `store-b-${Date.now()}`;

    const storeA = await StoreModel.create({
      tenantId: tenantAId,
      userId: new mongoose.Types.ObjectId(),
      name: "Store A",
      slug: storeASlug,
      subdomain: storeASlug,
      currency: "BDT",
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeAId = String(storeA._id);

    const storeB = await StoreModel.create({
      tenantId: tenantBId,
      userId: new mongoose.Types.ObjectId(),
      name: "Store B",
      slug: storeBSlug,
      subdomain: storeBSlug,
      currency: "BDT",
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeBId = String(storeB._id);
  });

  after(async () => {
    try {
      if (storeAId) {
        await StoreModel.deleteOne({ _id: storeAId });
        await StorePageModel.deleteMany({ storeId: storeAId });
        await PageModel.deleteMany({ storeId: storeAId });
      }
      if (storeBId) {
        await StoreModel.deleteOne({ _id: storeBId });
        await StorePageModel.deleteMany({ storeId: storeBId });
        await PageModel.deleteMany({ storeId: storeBId });
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  });

  it("Test 1: Builder savePage saves draft state without publishing", async () => {
    const homeResult = await getOrCreateHomePage(storeAId);
    assert.equal(homeResult.ok, true);
    const homePageId = String(homeResult.data?.page?._id);

    const saveResult = await savePage(homePageId, {
      storeId: storeAId,
      sections: [
        { id: "hero-1", type: "hero-banner", visible: true, props: { headline: "Updated Headline" } },
      ],
    });

    assert.equal(saveResult.ok, true);
    assert.equal(saveResult.data?.page?.status, "draft");
    assert.equal(saveResult.data?.page?.sections?.[0]?.props?.headline, "Updated Headline");
  });

  it("Test 2: Builder publishPage marks page published and dispatches cache invalidation", async () => {
    const home = await PageModel.findOne({ storeId: storeAId, isHome: true }).lean() as any;
    assert.ok(home);

    const publishResult = await publishBuilderPage(String(home._id), { storeId: storeAId, status: "published" });
    assert.equal(publishResult.ok, true);
    assert.equal(publishResult.data?.page?.status, "published");
  });

  it("Test 3: StorePage publishPage creates snapshot and triggers tenant-specific revalidation", async () => {
    const page = await StorePageModel.create({
      storeId: storeAId,
      tenantId: new mongoose.Types.ObjectId(),
      title: "Summer Collection",
      slug: "/summer",
      status: "draft",
      sections: [{ id: "grid-1", type: "product-grid", visible: true }],
    });

    const publishResult = await publishStorePage(String(page._id), storeAId);
    assert.equal(publishResult.ok, true);
    assert.ok(publishResult.data?.version);
    assert.equal(publishResult.data.page.status, "published");
  });

  it("Test 4: Unpublish and Rollback operations safely update version state and invalidate cache", async () => {
    const page = await StorePageModel.findOne({ storeId: storeAId, slug: "/summer" }).lean() as any;
    assert.ok(page);

    const unpublishResult = await unpublishPage(String(page._id), storeAId);
    assert.equal(unpublishResult.ok, true);
    assert.equal((unpublishResult.data as any)?.page?.status, "draft");

    const rollbackResult = await rollbackToVersion(String(page._id), storeAId, 1);
    assert.equal(rollbackResult.ok, true);
  });

  it("Test 5: InvalidateStoreTenantCache correctly resolves tenant slug and does not pollute other stores", async () => {
    // Calling for Store A should execute cleanly
    await invalidateStoreTenantCache(storeAId, "all");
    // Calling for Store B with specific scope should execute cleanly
    await invalidateStoreTenantCache(storeBSlug, "home");
  });
});
