import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const appDir = path.resolve(projectRoot, "apps/web/src/app");
const outputDir = path.resolve(projectRoot, "tests/e2e/data");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

export type RouteCategory = 
  | "public"
  | "auth"
  | "workspace"
  | "store_erp"
  | "store_builder"
  | "legacy_dashboard"
  | "storefront"
  | "admin"
  | "other";

export interface DiscoveredRoute {
  sourceFile: string;
  routePattern: string;
  category: RouteCategory;
  authRequired: boolean;
  requiredRole?: "merchant" | "super_admin" | "employee" | "staff";
}

const routes: DiscoveredRoute[] = [];

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name === "page.tsx" || entry.name === "page.jsx") {
      const relPath = path.relative(appDir, fullPath);
      // Remove page.tsx
      const routeParts = relPath
        .replace(/page\.(tsx|jsx)$/, "")
        .split(path.sep)
        .filter(Boolean)
        // Filter out route groups like (store), (shell), (auth), (admin)
        .filter((part) => !part.startsWith("(") || !part.endsWith(")"));

      const routePattern = "/" + routeParts.join("/");
      
      let category: RouteCategory = "other";
      let authRequired = true;
      let requiredRole: DiscoveredRoute["requiredRole"] = undefined;

      if (routePattern.startsWith("/site/")) {
        category = "storefront";
        authRequired = false;
      } else if (
        routePattern === "/login" ||
        routePattern === "/register" ||
        routePattern === "/forgot-password" ||
        routePattern === "/reset-password" ||
        routePattern === "/verify-email" ||
        routePattern === "/admin/login"
      ) {
        category = "auth";
        authRequired = false;
      } else if (routePattern.includes("/builder")) {
        category = "store_builder";
        authRequired = true;
        requiredRole = "merchant";
      } else if (routePattern.startsWith("/store/")) {
        category = "store_erp";
        authRequired = true;
        requiredRole = "merchant";
      } else if (routePattern.startsWith("/workshops")) {
        category = "workspace";
        authRequired = true;
        requiredRole = "merchant";
      } else if (routePattern.startsWith("/admin") || routePattern === "/admin") {
        category = "admin";
        authRequired = true;
        requiredRole = "super_admin";
      } else if (routePattern.startsWith("/dashboard")) {
        category = "legacy_dashboard";
        authRequired = true;
        requiredRole = "merchant";
      } else {
        // Marketing / Static Public
        category = "public";
        authRequired = false;
      }

      routes.push({
        sourceFile: relPath,
        routePattern,
        category,
        authRequired,
        requiredRole,
      });
    }
  }
}

scanDir(appDir);

// Sort routes deterministically
routes.sort((a, b) => a.routePattern.localeCompare(b.routePattern));

const outputPath = path.join(outputDir, "routes-inventory.json");
fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2), "utf8");

console.log(`✅ Discovered ${routes.length} total routes from Next.js App Router.`);
console.log(`📁 Saved route inventory to: ${outputPath}`);

const summary = routes.reduce((acc, r) => {
  acc[r.category] = (acc[r.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log("📊 Route breakdown by category:", summary);
