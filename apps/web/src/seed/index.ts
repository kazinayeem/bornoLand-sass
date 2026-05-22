import { randomBytes } from "crypto";
import { connectWebDatabase } from "@/lib/mongoose";
import { hashPassword } from "@/lib/password";
import { AdminLogModel } from "@/models/admin-log.model";
import { MembershipModel } from "@/models/membership.model";
import { SubscriptionModel } from "@/models/subscription.model";
import { TemplateModel } from "@/models/template.model";
import { TenantModel } from "@/models/tenant.model";
import { UserModel } from "@/models/user.model";

async function upsertUser(email: string, data: Record<string, unknown>) {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    await UserModel.updateOne({ email }, { $set: data });
    return UserModel.findOne({ email });
  }

  return UserModel.create(data);
}

export async function seedDatabase() {
  await connectWebDatabase();

  const superAdminPassword = await hashPassword("Admin@123");
  const demoUserPassword = await hashPassword("Demo@123");

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
      status: "active",
      createdBy: superAdmin._id
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

  await MembershipModel.updateOne(
    { tenantId: demoTenant._id, userId: demoUser._id },
    { $setOnInsert: { role: "admin", status: "active", invitedAt: new Date(), acceptedAt: new Date() } },
    { upsert: true }
  );

  await SubscriptionModel.updateOne(
    { tenantId: demoTenant._id },
    { $setOnInsert: { provider: "stripe", plan: "growth", status: "active" } },
    { upsert: true }
  );

  await TemplateModel.updateOne(
    { slug: "hero-startup" },
    {
      $setOnInsert: {
        name: "Hero Startup",
        slug: "hero-startup",
        category: "landing-page",
        isPublic: true,
        blocks: [
          { type: "hero", props: { headline: "Launch faster with BornoLand" } },
          { type: "cta", props: { text: "Start free" } }
        ],
        createdBy: superAdmin._id
      }
    },
    { upsert: true }
  );

  await AdminLogModel.updateOne(
    { action: "seed_completed", entityType: "System" },
    {
      $setOnInsert: {
        actorId: superAdmin._id,
        tenantId: demoTenant._id,
        action: "seed_completed",
        entityType: "System",
        metadata: { seedRunId: randomBytes(8).toString("hex") }
      }
    },
    { upsert: true }
  );

  console.log("Seed complete: super admin, demo tenant, demo user, subscription, template");
}
