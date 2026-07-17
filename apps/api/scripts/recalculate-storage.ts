import { connectDatabase } from "../src/common/database/connection.js";
import { recalculateAllStoreStorage } from "../src/modules/media/media-storage.service.js";

async function main() {
  await connectDatabase();
  console.log("[recalculate-storage] Starting full storage recalculation...");
  const start = Date.now();
  const results = await recalculateAllStoreStorage();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[recalculate-storage] Done. Processed: ${results.processed}, Failed: ${results.failed}, Time: ${elapsed}s`);
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[recalculate-storage] Fatal error:", err);
  process.exit(1);
});
