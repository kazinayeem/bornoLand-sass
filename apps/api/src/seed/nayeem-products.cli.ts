import { connectDatabase } from "../config/database.js";
import { seedNayeemProducts } from "./nayeem-products.seed.js";

async function main() {
  await connectDatabase();
  await seedNayeemProducts();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Nayeem products seed failed", error);
    process.exit(1);
  });
