import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { AuditLogModel } from "../models/audit-log.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { StoreMemberModel } from "../modules/team/store-member.model.js";
import { StoreModel } from "../models/store.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { seedTemplates } from "./templates.js";
import { seedNayeemProducts } from "./nayeem-products.seed.js";
import { runSafeMigration } from "../bootstrap/safe-migrate.js";

export async function seedDatabase() {
  await connectDatabase();

  // Safe platform defaults — never overwrites existing production data
  await runSafeMigration();

  const superAdminEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? "admin@bornoland.com";
  const superAdminPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? "Admin@123";
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

  let superAdmin = await UserModel.findOne({ email: superAdminEmail });
  if (!superAdmin) {
    superAdmin = await UserModel.create({
      name: "Super Admin",
      email: superAdminEmail,
      passwordHash: superAdminPasswordHash,
      role: "super_admin",
      status: "active",
      rememberMe: true,
    });
  } else if (superAdmin.role !== "super_admin") {
    await UserModel.updateOne({ _id: superAdmin._id }, { $set: { role: "super_admin", status: "active" } });
  }

  const demoTenant =
    (await TenantModel.findOne({ slug: "demo" })) ||
    (await TenantModel.create({
      name: "Demo Tenant",
      slug: "demo",
      subdomain: "demo",
      plan: "growth",
      status: "active",
    }));

  let demoUser = await UserModel.findOne({ email: "demo@bornoland.com" });
  const demoUserPassword = await bcrypt.hash("Demo@123", 12);
  if (!demoUser) {
    demoUser = await UserModel.create({
      name: "Demo Merchant",
      email: "demo@bornoland.com",
      passwordHash: demoUserPassword,
      role: "owner",
      tenantId: demoTenant._id,
      status: "active",
      rememberMe: true,
    });
  } else {
    await UserModel.updateOne(
      { _id: demoUser._id },
      { $set: { role: "owner", tenantId: demoTenant._id, status: "active" } }
    );
  }

  await TeamMemberModel.updateOne(
    { tenantId: demoTenant._id, userId: demoUser._id },
    { $set: { role: "owner", status: "active", invitedAt: new Date(), acceptedAt: new Date() } },
    { upsert: true }
  );

  let demoStore = await StoreModel.findOne({ slug: "demo-store" });
  if (!demoStore) {
    demoStore = await StoreModel.create({
      tenantId: demoTenant._id,
      userId: demoUser._id,
      name: "Demo Store",
      slug: "demo-store",
      subdomain: "demo-store",
      category: "ecommerce",
      storeType: "ecommerce",
      plan: "growth",
      billingStatus: "active",
      subscriptionStatus: "active",
      status: "active",
      published: true,
      brandColor: "#0066cc",
      accentColor: "#0f172a",
      tagline: "Your premier demo storefront",
    });
  } else {
    await StoreModel.updateOne(
      { _id: demoStore._id },
      { $set: { userId: demoUser._id, tenantId: demoTenant._id, status: "active" } }
    );
  }

  await StoreMemberModel.updateOne(
    { storeId: demoStore._id, userId: demoUser._id },
    { $set: { role: "owner", status: "active" } },
    { upsert: true }
  );

  await SubscriptionModel.updateOne(
    { tenantId: demoTenant._id },
    { $setOnInsert: { provider: "manual", plan: "free", status: "active" } },
    { upsert: true }
  );

  await AuditLogModel.updateOne(
    { action: "seed_completed", entityType: "System" },
    {
      $setOnInsert: {
        actorId: superAdmin?._id,
        tenantId: demoTenant._id,
        action: "seed_completed",
        entityType: "System",
        metadata: { seedRunId: randomBytes(8).toString("hex") },
      },
    },
    { upsert: true }
  );

  await seedTemplates();

  await seedNayeemProducts();

  console.log("Seed complete: safe migration, demo tenant (if missing), templates, nayeem store products");
}
