import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyHost,
  resolveStoreKeyForRequest,
  stripPort,
  type HostResolutionConfig,
} from "@/lib/host-resolution";
import { resolveTenantFromHost } from "@/lib/tenant-resolution";

describe("Production Root-Domain & Tenant Subdomain Host Resolution", () => {
  const prodConfig: HostResolutionConfig = {
    rootDomain: "bornosoft.site",
    rootHostname: "bornosoft.site",
    platformBases: [],
  };

  it("1. Platform root domain bornosoft.site is classified as platform (NOT a tenant)", () => {
    const c1 = classifyHost("bornosoft.site", prodConfig);
    assert.equal(c1.kind, "platform");
    assert.equal(c1.storeKey, null);

    const res1 = resolveStoreKeyForRequest("bornosoft.site");
    // With prod config
    const c1Custom = classifyHost("bornosoft.site", prodConfig);
    assert.equal(c1Custom.kind, "platform");
    assert.equal(c1Custom.storeKey, null);

    const tenantRes = resolveTenantFromHost("bornosoft.site");
    // Under prod config, storeSlug must be null so middleware will not rewrite to /site/bornosoft.site
    const prodTenantRes = classifyHost("bornosoft.site", prodConfig);
    assert.equal(prodTenantRes.storeKey, null);
  });

  it("2. Platform www.bornosoft.site is classified as platform apex", () => {
    const c = classifyHost("www.bornosoft.site", prodConfig);
    assert.equal(c.kind, "platform");
    assert.equal(c.storeKey, null);
  });

  it("3. Tenant subdomain nayeem.bornosoft.site resolves to tenant 'nayeem'", () => {
    const c = classifyHost("nayeem.bornosoft.site", prodConfig);
    assert.equal(c.kind, "tenant-subdomain");
    assert.equal(c.storeKey, "nayeem");

    const cWithPort = classifyHost("nayeem.bornosoft.site:3000", prodConfig);
    assert.equal(cWithPort.kind, "tenant-subdomain");
    assert.equal(cWithPort.storeKey, "nayeem");

    const other = classifyHost("rahim.bornosoft.site", prodConfig);
    assert.equal(other.kind, "tenant-subdomain");
    assert.equal(other.storeKey, "rahim");
  });

  it("4. Infrastructure subdomains (admin, api, app) on root domain do not become store tenants", () => {
    const admin = classifyHost("admin.bornosoft.site", prodConfig);
    assert.equal(admin.kind, "platform");
    assert.equal(admin.storeKey, null);

    const api = classifyHost("api.bornosoft.site", prodConfig);
    assert.equal(api.kind, "platform");
    assert.equal(api.storeKey, null);

    const app = classifyHost("app.bornosoft.site", prodConfig);
    assert.equal(app.kind, "platform");
    assert.equal(app.storeKey, null);
  });

  it("5. Local development nayeem.localhost and nayeem.localhost:3000 resolve to 'nayeem'", () => {
    const c1 = classifyHost("nayeem.localhost:3000", prodConfig);
    assert.equal(c1.kind, "tenant-subdomain");
    assert.equal(c1.storeKey, "nayeem");

    const c2 = classifyHost("nayeem.localhost", prodConfig);
    assert.equal(c2.kind, "tenant-subdomain");
    assert.equal(c2.storeKey, "nayeem");

    const apex = classifyHost("localhost:3000", prodConfig);
    assert.equal(apex.kind, "platform");
    assert.equal(apex.storeKey, null);
  });

  it("6. nip.io testing nayeem.3.111.51.117.nip.io:3000 resolves to 'nayeem'", () => {
    const c = classifyHost("nayeem.3.111.51.117.nip.io:3000", prodConfig);
    assert.equal(c.kind, "tenant-subdomain");
    assert.equal(c.storeKey, "nayeem");

    const apex = classifyHost("3.111.51.117.nip.io:3000", prodConfig);
    assert.equal(apex.kind, "platform");
    assert.equal(apex.storeKey, null);
  });

  it("7. Direct IP access 3.111.51.117:3000 is classified as platform (NOT tenant)", () => {
    const c = classifyHost("3.111.51.117:3000", prodConfig);
    assert.equal(c.kind, "platform");
    assert.equal(c.storeKey, null);

    const cNoPort = classifyHost("3.111.51.117", prodConfig);
    assert.equal(cNoPort.kind, "platform");
    assert.equal(cNoPort.storeKey, null);
  });

  it("8. Customer custom domains resolve to custom-domain with stripped port", () => {
    const c1 = classifyHost("mybrand.store", prodConfig);
    assert.equal(c1.kind, "custom-domain");
    assert.equal(c1.storeKey, "mybrand.store");

    const c2 = classifyHost("store.client-company.com:3000", prodConfig);
    assert.equal(c2.kind, "custom-domain");
    assert.equal(c2.storeKey, "store.client-company.com");
  });

  it("9. Port-specific ROOT_DOMAIN (e.g. localhost:3000) in local dev resolves correctly", () => {
    const devConfig: HostResolutionConfig = {
      rootDomain: "localhost:3000",
      rootHostname: "localhost",
      platformBases: [],
    };

    const apex = classifyHost("localhost:3000", devConfig);
    assert.equal(apex.kind, "platform");
    assert.equal(apex.storeKey, null);

    const tenant = classifyHost("nayeem.localhost:3000", devConfig);
    assert.equal(tenant.kind, "tenant-subdomain");
    assert.equal(tenant.storeKey, "nayeem");
  });

  it("10. stripPort safely handles IPv4, IPv6, and standard ports", () => {
    assert.equal(stripPort("bornosoft.site:3000"), "bornosoft.site");
    assert.equal(stripPort("bornosoft.site"), "bornosoft.site");
    assert.equal(stripPort("127.0.0.1:4000"), "127.0.0.1");
    assert.equal(stripPort("[::1]:3000"), "::1");
  });

  it("11. Platform route classification distinguishes platform vs tenant paths", () => {
    const { isPlatformRoute } = require("../tenant-resolution");
    assert.equal(isPlatformRoute("/workshops"), true);
    assert.equal(isPlatformRoute("/workshops/anything"), true);
    assert.equal(isPlatformRoute("/dashboard"), true);
    assert.equal(isPlatformRoute("/dashboard/stores"), true);
    assert.equal(isPlatformRoute("/login"), true);
    assert.equal(isPlatformRoute("/pricing"), true);
    assert.equal(isPlatformRoute("/features"), true);
    assert.equal(isPlatformRoute("/api/stores"), true);
    assert.equal(isPlatformRoute("/"), true);
  });

  it("12. Reserved subdomains include workshops and do not become store tenants", () => {
    const workshops = classifyHost("workshops.bornosoft.site", prodConfig);
    assert.equal(workshops.kind, "platform");
    assert.equal(workshops.storeKey, null);
  });
});
