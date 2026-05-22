import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { AuditLogModel } from "../models/audit-log.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";

async function upsertUser(email: string, data: Record<string, unknown>) {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    await UserModel.updateOne({ email }, { $set: data });
    return UserModel.findOne({ email });
  }

  return UserModel.create(data);
}

export async function seedDatabase() {
  await connectDatabase();

  const superAdminPassword = await bcrypt.hash("Admin@123", 12);
  const demoUserPassword = await bcrypt.hash("Demo@123", 12);

  const superAdmin = await upsertUser("admin@bornoland.com", {
    name: "Super Admin",
    email: "admin@bornoland.com",
    passwordHash: superAdminPassword,
    role: "super_admin",
    status: "active",
    rememberMe: true
  });

  const demoTenant =
    (await TenantModel.findOne({ slug: "demo" })) ||
    (await TenantModel.create({
      name: "Demo Tenant",
      slug: "demo",
      subdomain: "demo",
      plan: "growth",
      status: "active"
    }));

  const demoUser = await upsertUser("demo@bornoland.com", {
    name: "Demo User",
    email: "demo@bornoland.com",
    passwordHash: demoUserPassword,
    role: "admin",
    tenantId: demoTenant._id,
    status: "active",
    rememberMe: true
  });

  await TeamMemberModel.updateOne(
    { tenantId: demoTenant._id, userId: demoUser._id },
    { $setOnInsert: { role: "admin", status: "active", invitedAt: new Date(), acceptedAt: new Date() } },
    { upsert: true }
  );

  await SubscriptionModel.updateOne(
    { tenantId: demoTenant._id },
    { $setOnInsert: { provider: "stripe", plan: "growth", status: "active" } },
    { upsert: true }
  );

  await AuditLogModel.updateOne(
    { action: "seed_completed", entityType: "System" },
    {
      $setOnInsert: {
        actorId: superAdmin!._id,
        tenantId: demoTenant._id,
        action: "seed_completed",
        entityType: "System",
        metadata: { seedRunId: randomBytes(8).toString("hex") }
      }
    },
    { upsert: true }
  );

  console.log("Seed complete: super admin, demo tenant, demo user");
}
