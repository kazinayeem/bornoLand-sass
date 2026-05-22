import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { VerificationTokenModel } from "../models/verification-token.model.js";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).lean();
}

export async function createTenant(payload: Record<string, unknown>) {
  return TenantModel.create(payload);
}

export async function createUser(payload: Record<string, unknown>) {
  return UserModel.create(payload);
}

export async function createTeamMembership(payload: Record<string, unknown>) {
  return TeamMemberModel.create(payload);
}

export async function createSubscription(payload: Record<string, unknown>) {
  return SubscriptionModel.create(payload);
}

export async function createVerificationToken(payload: Record<string, unknown>) {
  return VerificationTokenModel.create(payload);
}
