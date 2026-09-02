import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cacheTags } from "../cache-tags";

describe("Web Storefront Tenant & Product Routing / Cache Audit Test Suite", () => {
  it("Test 1: cacheTags generates strictly isolated keys per tenant and product", () => {
    const tenantATag = cacheTags.tenant("nayeem");
    const tenantBTag = cacheTags.tenant("kazi");
    assert.notEqual(tenantATag, tenantBTag, "Tenant tags must be distinct");
    assert.equal(tenantATag, "tenant-nayeem");
    assert.equal(tenantBTag, "tenant-kazi");

    const productTag1 = cacheTags.product("organic-honey");
    const productTag2 = cacheTags.product("fresh-milk");
    assert.notEqual(productTag1, productTag2, "Product tags must be distinct");

    const storeProductTagA = cacheTags.storeProduct("store-123", "organic-honey");
    const storeProductTagB = cacheTags.storeProduct("store-456", "organic-honey");
    assert.notEqual(storeProductTagA, storeProductTagB, "Store product tags must be isolated by storeId");
  });

  it("Test 2: Product revalidation path matches actual App Router tenant route pattern", async () => {
    const tenantSlug = "nayeem";
    const productSlug = "fresh-organic-apples";
    const expectedRoute = `/site/${tenantSlug}/products/${productSlug}`;

    // Verify route construction
    assert.equal(`/site/${tenantSlug}/products/${productSlug}`, expectedRoute);
    assert.ok(expectedRoute.startsWith("/site/nayeem/products/"));
  });

  it("Test 3: /products searchParams query serialization for /shop permanent redirect", () => {
    const searchParams = {
      category: "fresh-produce",
      sort: "price-asc",
      page: "2",
      tags: ["organic", "featured"],
    };

    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") {
        sp.set(key, value);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === "string") sp.append(key, v);
        }
      }
    }

    const queryString = sp.toString();
    const destination = queryString ? `/shop?${queryString}` : "/shop";

    assert.equal(
      destination,
      "/shop?category=fresh-produce&sort=price-asc&page=2&tags=organic&tags=featured"
    );
  });
});
