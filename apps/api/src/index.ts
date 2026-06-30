import { app } from "./app.js";
import { connectDatabase } from "./common/database/connection.js";
import { CartModel } from "./modules/cart/cart.model.js";
import { startBillingCronScheduler } from "./modules/subscriptions/billing-cron.service.js";
import { runSafeMigration } from "./bootstrap/safe-migrate.js";

const port = Number(process.env.PORT ?? 4000);

async function startServer() {
  try {
    await connectDatabase();
    await CartModel.syncIndexes();

    startBillingCronScheduler();
    app.listen(port, () => {
      console.log(`BornoLand API listening on port ${port}`);
      console.log("MongoDB connection established");

      void runSafeMigration().catch((error) => {
        console.error("[bootstrap] Safe migration failed:", error);
      });
    });
  } catch (error) {
    console.error("Failed to start API server", error);
    process.exit(1);
  }
}

void startServer();
