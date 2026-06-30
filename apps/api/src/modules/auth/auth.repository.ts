import { TenantModel } from "../workspaces/tenant.model.js";
import { UserModel } from "../users/user.model.js";
import { TeamMemberModel } from "../team/team-member.model.js";
import { SubscriptionModel } from "../subscriptions/subscription.model.js";
import { VerificationTokenModel } from "./verification-token.model.js";

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
