import { randomBytes } from "crypto";
import { connectWebDatabase } from "@/lib/mongoose";
import { hashPassword } from "@/lib/password";
import { AdminLogModel } from "@/models/admin-log.model";
import { MembershipModel } from "@/models/membership.model";
import { SubscriptionModel } from "@/models/subscription.model";
import { TemplateModel } from "@/models/template.model";
import { TenantModel } from "@/models/tenant.model";
import { UserModel } from "@/models/user.model";
import { env } from "@/config/env";

const SEED_ADMIN_EMAIL = env.isDev ? "admin@bornoland.com" : "admin@bornosoftnr.site";
const SEED_DEMO_EMAIL = env.isDev ? "demo@bornoland.com" : "demo@bornosoftnr.site";

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

  const superAdmin = await upsertUser(SEED_ADMIN_EMAIL, {
    name: "Super Admin",
    email: SEED_ADMIN_EMAIL,
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

  const demoUser = await upsertUser(SEED_DEMO_EMAIL, {
    name: "Demo User",
    email: SEED_DEMO_EMAIL,
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
}
