import { connectDatabase } from "../config/database.js";
import { runSafeMigration } from "../bootstrap/safe-migrate.js";

async function main() {
  await connectDatabase();
  await runSafeMigration();
  console.log("Safe migration CLI complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Safe migration failed:", error);
  process.exit(1);
});
