import mongoose from "mongoose";
import { connectDatabase } from "../common/database/connection.js";
import { findStoreByHostKey, resolveBySubdomain } from "../modules/stores/tenant-resolver.service.js";
import { StoreModel } from "../models/store.model.js";

async function runBenchmark() {
  await connectDatabase();
  console.log("==================================================");
  console.log("BORNO LAND PERFORMANCE BENCHMARK SUITE");
  console.log("==================================================");

  // 1. Identify real stores
  const stores = await StoreModel.find({ status: "active" }).limit(3).lean();
  console.log(`Found ${stores.length} active store(s) in database:`, stores.map((s: any) => s.slug));

  const targetSlugs = stores.map((s: any) => s.slug);
  if (targetSlugs.length === 0) {
    targetSlugs.push("nayeem");
  }

  // Clear cache service if possible
  const { cacheService } = await import("../common/cache/cache.service.js");

  for (const slug of targetSlugs) {
    console.log(`\n--- BENCHMARKING TENANT: "${slug}" ---`);

    // Invalidate cache for cold run
    await cacheService.del(`tenant:${slug}:home`);

    // Cold Run
    const coldStart = performance.now();
    const coldResult = await resolveBySubdomain(slug, "home");
    const coldDuration = performance.now() - coldStart;

    console.log(`[COLD RUN] status=${coldResult.ok ? "OK" : "FAILED"} TTFB=${coldDuration.toFixed(2)}ms`);

    // Warm Runs (10 iterations)
    const warmTimes: number[] = [];
    for (let i = 0; i < 10; i++) {
      const warmStart = performance.now();
      const warmResult = await resolveBySubdomain(slug, "home");
      const warmDuration = performance.now() - warmStart;
      warmTimes.push(warmDuration);
    }

    warmTimes.sort((a, b) => a - b);
    const min = warmTimes[0];
    const max = warmTimes[warmTimes.length - 1];
    const avg = warmTimes.reduce((acc, t) => acc + t, 0) / warmTimes.length;
    const p50 = warmTimes[Math.floor(warmTimes.length * 0.5)];
    const p95 = warmTimes[Math.floor(warmTimes.length * 0.95)];

    console.log(`[WARM RUNS] (N=10)`);
    console.log(`  Min:  ${min.toFixed(2)}ms`);
    console.log(`  Max:  ${max.toFixed(2)}ms`);
    console.log(`  Avg:  ${avg.toFixed(2)}ms`);
    console.log(`  p50:  ${p50.toFixed(2)}ms`);
    console.log(`  p95:  ${p95.toFixed(2)}ms`);
  }

  // Unknown Tenant Benchmark
  console.log(`\n--- BENCHMARKING UNKNOWN TENANT: "invalid-tenant-xyz-999" ---`);
  const unknownStart = performance.now();
  const unknownResult = await resolveBySubdomain("invalid-tenant-xyz-999", "home");
  const unknownDuration = performance.now() - unknownStart;
  console.log(`[UNKNOWN TENANT] status=${unknownResult.ok ? "OK" : "NOT_FOUND"} TTFB=${unknownDuration.toFixed(2)}ms message="${unknownResult.message}"`);

  // Concurrent Requests Benchmark
  console.log(`\n--- CONCURRENT REQUEST BENCHMARK (20 simultaneous requests) ---`);
  const concurrentStart = performance.now();
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const slug = targetSlugs[i % targetSlugs.length];
    promises.push(resolveBySubdomain(slug, "home"));
  }
  await Promise.all(promises);
  const concurrentTotal = performance.now() - concurrentStart;
  console.log(`[CONCURRENT] Total 20 requests completed in ${concurrentTotal.toFixed(2)}ms (avg ${(concurrentTotal / 20).toFixed(2)}ms/req)`);

  console.log("\n==================================================");
  console.log("BENCHMARK COMPLETED SUCCESSFULLY");
  console.log("==================================================");

  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
