import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { AuditLogModel } from "../models/audit-log.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { seedTemplates } from "./templates.js";
import { runSafeMigration } from "../bootstrap/safe-migrate.js";

export async function seedDatabase() {
  await connectDatabase();

  // Safe platform defaults — never overwrites existing production data
  await runSafeMigration();

  const superAdminCount = await UserModel.countDocuments({ role: "super_admin" });
  if (superAdminCount === 0) {
    const email = process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? "admin@bornoland.com";
    const password = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? "Admin@123";
    const passwordHash = await bcrypt.hash(password, 12);
    await UserModel.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: "super_admin",
      status: "active",
      rememberMe: true,
    });
  }

  const demoTenant =
    (await TenantModel.findOne({ slug: "demo" })) ||
    (await TenantModel.create({
      name: "Demo Tenant",
      slug: "demo",
      subdomain: "demo",
      plan: "free",
      status: "active",
    }));

  const demoUser = await UserModel.findOne({ email: "demo@bornoland.com" });
  if (!demoUser) {
    const demoUserPassword = await bcrypt.hash("Demo@123", 12);
    const created = await UserModel.create({
      name: "Demo User",
      email: "demo@bornoland.com",
      passwordHash: demoUserPassword,
      role: "admin",
      tenantId: demoTenant._id,
      status: "active",
      rememberMe: true,
    });

    await TeamMemberModel.updateOne(
      { tenantId: demoTenant._id, userId: created._id },
      { $setOnInsert: { role: "admin", status: "active", invitedAt: new Date(), acceptedAt: new Date() } },
      { upsert: true }
    );
  }

  await SubscriptionModel.updateOne(
    { tenantId: demoTenant._id },
    { $setOnInsert: { provider: "manual", plan: "free", status: "active" } },
    { upsert: true }
  );

  const superAdmin = await UserModel.findOne({ role: "super_admin" });
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

  console.log("Seed complete: safe migration, demo tenant (if missing), templates");
}
