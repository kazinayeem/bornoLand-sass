import { performance } from "node:perf_hooks";

const STORE_SLUG = "nayeem";
const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:4000";

const ROUTES = [
  `/store/${STORE_SLUG}/dashboard`,
  `/store/${STORE_SLUG}/orders`,
  `/store/${STORE_SLUG}/customers`,
  `/store/${STORE_SLUG}/products`,
  `/store/${STORE_SLUG}/categories`,
  `/store/${STORE_SLUG}/orders/incomplete`,
  `/store/${STORE_SLUG}/reviews`,
  `/store/${STORE_SLUG}/inventory`,
  `/store/${STORE_SLUG}/inventory/warehouses`,
  `/store/${STORE_SLUG}/inventory/ledger`,
  `/store/${STORE_SLUG}/inventory/waste`,
  `/store/${STORE_SLUG}/inventory/purchasing`,
  `/store/${STORE_SLUG}/inventory/suppliers`,
  `/store/${STORE_SLUG}/pos`,
  `/store/${STORE_SLUG}/pos/shifts`,
  `/store/${STORE_SLUG}/hrm/employees`,
  `/store/${STORE_SLUG}/hrm/organization`,
  `/store/${STORE_SLUG}/hrm/attendance`,
  `/store/${STORE_SLUG}/hrm/leaves`,
  `/store/${STORE_SLUG}/hrm/payroll`,
  `/store/${STORE_SLUG}/hrm/self-service`,
  `/store/${STORE_SLUG}/finance/accounting`,
  `/store/${STORE_SLUG}/finance/accounting/coa`,
  `/store/${STORE_SLUG}/finance/accounting/journal`,
  `/store/${STORE_SLUG}/finance/expenses`,
  `/store/${STORE_SLUG}/finance/reports`,
  `/store/${STORE_SLUG}/crm/deals`,
  `/store/${STORE_SLUG}/support/tickets`,
  `/store/${STORE_SLUG}/marketing`,
  `/store/${STORE_SLUG}/coupons`,
  `/store/${STORE_SLUG}/settings/tracking`,
  `/store/${STORE_SLUG}/reports`,
  `/store/${STORE_SLUG}/operations/approvals`,
  `/store/${STORE_SLUG}/operations/tasks`,
  `/store/${STORE_SLUG}/settings/shipping`,
  `/store/${STORE_SLUG}/settings/courier`,
  `/store/${STORE_SLUG}/settings/payments`,
  `/store/${STORE_SLUG}/settings/taxes`,
  `/store/${STORE_SLUG}/design`,
  `/store/${STORE_SLUG}/settings`,
  `/store/${STORE_SLUG}/pages`,
  `/store/${STORE_SLUG}/media`,
  `/store/${STORE_SLUG}/customer-messages`,
  `/store/${STORE_SLUG}/members`,
  `/store/${STORE_SLUG}/apps`,
  `/store/${STORE_SLUG}/activity`,
  `/store/${STORE_SLUG}/billing`,
];

async function main() {
  console.log("==================================================");
  console.log("BORNOLAND STORE PLATFORM ROUTE VERIFICATION MATRIX");
  console.log("==================================================");

  // Authenticate merchant to acquire valid session cookies
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@bornoland.com", password: "Demo@123", loginType: "user" }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  const cookieHeader = setCookies.map((c: string) => c.split(";")[0]).filter(Boolean).join("; ");

  console.log(`Authenticated as: ${loginJson.data?.user?.email || "demo@bornoland.com"}`);
  console.log(`Testing ${ROUTES.length} store routes on host ${BASE_URL}...\n`);

  const results: Array<{
    route: string;
    status: number;
    durationMs: number;
    bytes: number;
    ok: boolean;
  }> = [];

  for (const route of ROUTES) {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: {
          Cookie: cookieHeader,
          Authorization: `Bearer ${token}`,
          "User-Agent": "BornoLand-Performance-Audit-Agent/1.0",
        },
        redirect: "manual",
      });
      const text = await res.text();
      const durationMs = performance.now() - start;
      const ok = res.status === 200 || res.status === 307; // 200 or clean auth redirect
      results.push({
        route,
        status: res.status,
        durationMs: Math.round(durationMs),
        bytes: text.length,
        ok: res.status === 200,
      });
      console.log(
        `${ok ? "✓" : "✗"} [${res.status}] ${route} — ${Math.round(durationMs)}ms (${(text.length / 1024).toFixed(1)} KB)`
      );
    } catch (err: any) {
      const durationMs = performance.now() - start;
      results.push({
        route,
        status: 500,
        durationMs: Math.round(durationMs),
        bytes: 0,
        ok: false,
      });
      console.log(`✗ [ERR] ${route} — ${err.message}`);
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const avgTime = Math.round(results.reduce((acc, r) => acc + r.durationMs, 0) / results.length);
  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed}/${results.length} routes passed (Avg Latency: ${avgTime}ms)`);
  console.log("==================================================");
}

main().catch(console.error);
