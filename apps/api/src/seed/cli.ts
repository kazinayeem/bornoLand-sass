import { seedDatabase } from "./index.js";

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
