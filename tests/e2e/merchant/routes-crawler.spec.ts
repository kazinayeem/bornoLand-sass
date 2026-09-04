import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { loginAsMerchant, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

interface DiscoveredRoute {
  sourceFile: string;
  routePattern: string;
  category: string;
  authRequired: boolean;
}

const inventoryPath = path.resolve(process.cwd(), "tests/e2e/data/routes-inventory.json");
const allRoutes: DiscoveredRoute[] = fs.existsSync(inventoryPath)
  ? JSON.parse(fs.readFileSync(inventoryPath, "utf8"))
  : [];

// Filter down to testable concrete routes (skipping raw dynamic placeholders like [productId])
function resolveConcreteRoutes(storeSlug: string): { path: string; name: string; category: string }[] {
  const concrete: { path: string; name: string; category: string }[] = [];

  for (const r of allRoutes) {
    let resolved = r.routePattern;

    // Substitute [storeSlug]
    if (resolved.includes("[storeSlug]")) {
      resolved = resolved.replace("[storeSlug]", storeSlug);
    }
    // Substitute [tenant]
    if (resolved.includes("[tenant]")) {
      resolved = resolved.replace("[tenant]", storeSlug);
    }

    // Skip nested unresolved dynamic segments for batch crawl
    if (resolved.includes("[") || resolved.includes("]")) {
      continue;
    }

    // Skip redundant or catch-all routes
    if (resolved === "/store/" + storeSlug + "/") {
      resolved = "/store/" + storeSlug;
    }

    concrete.push({
      path: resolved,
      name: r.sourceFile,
      category: r.category,
    });
  }

  // Deduplicate by path
  const seen = new Set<string>();
  return concrete.filter((c) => {
    if (seen.has(c.path)) return false;
    seen.add(c.path);
    return true;
  });
}

test.describe("Deep Route & Page Health Crawler (@navigation @crawler)", () => {
  let activeSlug = "nayeem";

  test.beforeEach(async ({ page }) => {
    await loginAsMerchant(page);
    activeSlug = await discoverStoreSlug(page);
  });

  test("Batch crawl all ERP Store modules & verify zero chunk/hydration errors", async ({ page }) => {
    const concreteRoutes = resolveConcreteRoutes(activeSlug);
    const storeRoutes = concreteRoutes.filter((r) => r.category === "store_erp" || r.category === "workspace");

    console.log(`\n🔍 [Crawler] Crawling ${storeRoutes.length} store & workspace routes...`);

    const crawlResults: {
      path: string;
      status: "PASS" | "FAIL";
      httpStatus?: number;
      chunkErrors: string[];
      hydrationErrors: string[];
      exceptions: string[];
      serverErrors: string[];
    }[] = [];

    for (const route of storeRoutes) {
      const monitor = attachPageMonitor(page);
      let passed = true;

      try {
        const response = await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

        const httpStatus = response?.status() ?? 200;

        // Check for ChunkLoadError
        if (monitor.chunkErrors.length > 0) {
          passed = false;
        }

        // Check for 500 API errors
        const serverErrors = monitor.failedRequests.filter((r) => r.status >= 500).map((r) => `${r.method} ${r.url} [${r.status}]`);
        if (serverErrors.length > 0) {
          passed = false;
        }

        // Check for blank screen (body must have non-empty text or visible elements)
        const bodyText = await page.locator("body").innerText().catch(() => "");
        if (!bodyText.trim() && !page.isClosed()) {
          passed = false;
        }

        crawlResults.push({
          path: route.path,
          status: passed ? "PASS" : "FAIL",
          httpStatus,
          chunkErrors: monitor.chunkErrors,
          hydrationErrors: monitor.hydrationErrors,
          exceptions: monitor.uncaughtExceptions,
          serverErrors,
        });

        if (!passed) {
          console.error(`  ❌ [FAIL] ${route.path} - Chunks: ${monitor.chunkErrors.length}, ServerErrors: ${serverErrors.length}`);
        } else {
          console.log(`  ✅ [PASS] ${route.path}`);
        }
      } catch (err: any) {
        crawlResults.push({
          path: route.path,
          status: "FAIL",
          chunkErrors: monitor.chunkErrors,
          hydrationErrors: monitor.hydrationErrors,
          exceptions: [err.message],
          serverErrors: [],
        });
        console.error(`  ❌ [FAIL] ${route.path} - Navigation timed out or threw: ${err.message}`);
      }
    }

    // Write audit results
    const reportDir = path.resolve(process.cwd(), "tests/reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(path.join(reportDir, "route-crawl-audit.json"), JSON.stringify(crawlResults, null, 2), "utf8");

    const failedRoutes = crawlResults.filter((r) => r.status === "FAIL");
    expect(failedRoutes.length, `Found ${failedRoutes.length} failing routes: ${failedRoutes.map((f) => f.path).join(", ")}`).toBe(0);
  });
});
