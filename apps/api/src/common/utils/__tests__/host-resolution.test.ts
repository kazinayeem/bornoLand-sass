import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyHost,
  resolveStoreKeyForRequest,
  stripPort,
  type HostResolutionConfig,
} from "../host-resolution.js";

describe("Backend Host Resolution Test Suite", () => {
  const prodConfig: HostResolutionConfig = {
    rootDomain: "bornosoft.site",
    rootHostname: "bornosoft.site",
    platformBases: [],
  };

  it("1. Platform root domain bornosoft.site is classified as platform (NOT a tenant)", () => {
    const c1 = classifyHost("bornosoft.site", prodConfig);
    assert.equal(c1.kind, "platform");
    assert.equal(c1.storeKey, null);

    const cWww = classifyHost("www.bornosoft.site", prodConfig);
    assert.equal(cWww.kind, "platform");
    assert.equal(cWww.storeKey, null);
  });

  it("2. Tenant subdomains on bornosoft.site resolve to tenant storeKey", () => {
    const c1 = classifyHost("nayeem.bornosoft.site", prodConfig);
    assert.equal(c1.kind, "tenant-subdomain");
    assert.equal(c1.storeKey, "nayeem");

    const cPort = classifyHost("nayeem.bornosoft.site:3000", prodConfig);
    assert.equal(cPort.kind, "tenant-subdomain");
    assert.equal(cPort.storeKey, "nayeem");
  });

  it("3. Local development and nip.io subdomains resolve correctly", () => {
    const cLocal = classifyHost("nayeem.localhost:3000", prodConfig);
    assert.equal(cLocal.kind, "tenant-subdomain");
    assert.equal(cLocal.storeKey, "nayeem");

    const cNip = classifyHost("nayeem.3.111.51.117.nip.io:3000", prodConfig);
    assert.equal(cNip.kind, "tenant-subdomain");
    assert.equal(cNip.storeKey, "nayeem");
  });

  it("4. Bare IP access is classified as platform", () => {
    const cIp = classifyHost("3.111.51.117:3000", prodConfig);
    assert.equal(cIp.kind, "platform");
    assert.equal(cIp.storeKey, null);
  });

  it("5. Custom domains resolve cleanly", () => {
    const cCustom = classifyHost("client-store.com", prodConfig);
    assert.equal(cCustom.kind, "custom-domain");
    assert.equal(cCustom.storeKey, "client-store.com");
  });
});
