import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreMemberModel } from "./store-member.model.js";
import { StoreModel } from "../stores/store.model.js";
import { UserModel } from "../users/user.model.js";
import { sendEmail } from "../../common/integrations/email.js";
import { getWebUrl } from "../../common/utils/app-url.js";
import {
  hasPermission,
  roleToPermissions,
  isValidPermission,
  STORE_MEMBER_ROLES,
  type StoreMemberRole,
  type Permission,
} from "../../common/types/permissions.js";
import {
  resolveStoreLimit,
  resolveStoreFeature,
} from "../stores/store-override.service.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type InviteMemberInput = {
  storeId: string;
  tenantId: string;
  email: string;
  name?: string;
  role: StoreMemberRole;
  permissions?: string[];
  invitedById: string;
};

export type UpdateMemberInput = {
  storeId: string;
  memberId: string;
  role?: StoreMemberRole;
  permissions?: string[];
  currentUserId: string;
  currentUserPermissions: string[];
};

export type MemberStatusInput = {
  storeId: string;
  memberId: string;
  status: "active" | "suspended" | "revoked";
  currentUserId: string;
  currentUserPermissions: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

function inviteTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7); // 7 days
  return d;
}

/** Ensure the current user can manage members (must be owner or have members:manage). */
function assertCanManageMembers(permissions: string[]) {
  if (!hasPermission(permissions, "members:manage")) {
    throw Object.assign(new Error("You do not have permission to manage members"), { status: 403 });
  }
}

/** Owners cannot be demoted, suspended, or removed via this service. */
async function assertNotOwner(storeId: string, memberId: string) {
  const member = await StoreMemberModel.findOne({ _id: memberId, storeId }).select("role email").lean() as { role: string; email: string } | null;
  if (!member) throw Object.assign(new Error("Member not found"), { status: 404 });
  if (member.role === "owner") throw Object.assign(new Error("The store owner cannot be modified via member management"), { status: 403 });
  return member;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * List all members for a store, joined with user data.
 */
export async function listStoreMembers(storeId: string) {
  await connectDatabase();

  const members = await StoreMemberModel.find({ storeId })
    .select("-inviteToken")
    .populate("userId", "name email avatarUrl lastLoginAt status")
    .lean();

  return members;
}

/**
 * Get the effective permissions for a user in a store.
 */
export async function getEffectiveUserPermissions(storeId: string, userId: string) {
  await connectDatabase();

  const store = await StoreModel.findById(storeId).select("userId").lean() as { userId: unknown } | null;
  if (!store) return null;

  const isOwner = String(store.userId) === userId;
  if (isOwner) {
    return { role: "owner" as StoreMemberRole, permissions: ["*"] as string[], isOwner: true };
  }

  const member = await StoreMemberModel.findOne({ storeId, userId, status: "active" })
    .select("role permissions status")
    .lean() as { role: string; permissions: string[]; status: string } | null;

  if (!member) return null;

  const roleDefaults = roleToPermissions(member.role as StoreMemberRole);
  const effectivePermissions = Array.from(new Set([...roleDefaults, ...member.permissions]));

  return {
    role: member.role as StoreMemberRole,
    permissions: effectivePermissions,
    isOwner: false,
  };
}

/**
 * Invite a new member to a store.
 * - Checks plan staff limit and staffManagement feature.
 * - Sends invite email.
 * - If user with that email already exists, links userId immediately.
 */
export async function inviteStoreMember(input: InviteMemberInput) {
  const { storeId, tenantId, email, name, role, permissions = [], invitedById } = input;

  if (!STORE_MEMBER_ROLES.includes(role) || role === "owner") {
    throw Object.assign(new Error("Invalid member role. Allowed: admin, manager, staff, viewer"), { status: 400 });
  }

  // Validate permission strings
  const invalidPerms = permissions.filter((p) => !isValidPermission(p));
  if (invalidPerms.length > 0) {
    throw Object.assign(new Error(`Invalid permission strings: ${invalidPerms.join(", ")}`), { status: 400 });
  }

  await connectDatabase();

  // ── Plan feature check: staffManagement must be enabled ──
  const staffFeatureEnabled = await resolveStoreFeature(storeId, "staffManagement");
  if (!staffFeatureEnabled) {
    throw Object.assign(new Error("Staff management is not available on your current plan. Please upgrade."), {
      status: 403,
      code: "FEATURE_NOT_ENABLED",
      requiredUpgrade: true,
    });
  }

  // ── Plan limit check: limits.staff ──
  const staffLimit = await resolveStoreLimit(storeId, "staff");
  if (staffLimit > 0) {
    // Count only active/invited members (exclude owner)
    const currentCount = await StoreMemberModel.countDocuments({
      storeId,
      role: { $ne: "owner" },
      status: { $in: ["active", "invited"] },
    });
    if (currentCount >= staffLimit) {
      throw Object.assign(
        new Error(`You have reached the staff member limit (${staffLimit}) for your current plan. Upgrade to add more.`),
        { status: 403, code: "LIMIT_REACHED", current: currentCount, limit: staffLimit, requiredUpgrade: true },
      );
    }
  }

  // ── Check duplicate ──
  const existing = await StoreMemberModel.findOne({ storeId, email }).lean() as { status: string } | null;
  if (existing) {
    if (existing.status === "revoked") {
      // Re-invite revoked member
      const token = generateInviteToken();
      await StoreMemberModel.updateOne(
        { storeId, email },
        {
          $set: {
            role,
            permissions,
            status: "invited",
            inviteToken: token,
            inviteExpiresAt: inviteTokenExpiry(),
            invitedBy: invitedById,
            invitedAt: new Date(),
            name: name ?? "",
          },
        },
      );
      await sendInviteEmail({ storeId, email, name: name ?? email, token, role });
      return { ok: true, message: "Invitation resent", status: "invited" };
    }
    throw Object.assign(new Error("This email is already a member or has a pending invitation"), { status: 409, code: "ALREADY_MEMBER" });
  }

  // ── Look up existing user account ──
  const existingUser = await UserModel.findOne({ email }).select("_id").lean() as { _id: unknown } | null;

  const token = generateInviteToken();
  const memberData = {
    storeId,
    tenantId,
    email,
    name: name ?? "",
    role,
    permissions,
    status: "invited" as const,
    inviteToken: token,
    inviteExpiresAt: inviteTokenExpiry(),
    invitedBy: invitedById,
    invitedAt: new Date(),
    userId: existingUser?._id ?? null,
  };

  await StoreMemberModel.create(memberData);

  await sendInviteEmail({ storeId, email, name: name ?? email, token, role });

  return { ok: true, message: "Invitation sent", status: "invited" };
}

async function sendInviteEmail({
  storeId,
  email,
  name,
  token,
  role,
}: { storeId: string; email: string; name: string; token: string; role: string }) {
  const store = await StoreModel.findById(storeId).select("name slug").lean() as { name: string; slug: string } | null;
  const storeName = store?.name ?? "BornoLand";
  const acceptUrl = `${getWebUrl()}/invite/${token}`;

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${storeName} on BornoLand`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px">You're invited!</h2>
        <p>Hi ${name},</p>
        <p><strong>${storeName}</strong> has invited you to join their store on BornoLand as a <strong>${role}</strong>.</p>
        <a href="${acceptUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#18181b;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">
          Accept Invitation
        </a>
        <p style="margin-top:24px;font-size:13px;color:#71717a">
          This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
        </p>
        <p style="font-size:12px;color:#a1a1aa">Or copy this link: ${acceptUrl}</p>
      </div>
    `,
  });
}

/**
 * Update a member's role and/or permissions.
 * Cannot demote/modify the store owner.
 */
export async function updateStoreMember(input: UpdateMemberInput) {
  const { storeId, memberId, role, permissions, currentUserId, currentUserPermissions } = input;

  assertCanManageMembers(currentUserPermissions);

  await connectDatabase();
  const target = await assertNotOwner(storeId, memberId);

  if (role && !STORE_MEMBER_ROLES.includes(role)) {
    throw Object.assign(new Error("Invalid role"), { status: 400 });
  }
  if (permissions) {
    const invalidPerms = permissions.filter((p) => !isValidPermission(p));
    if (invalidPerms.length > 0) {
      throw Object.assign(new Error(`Invalid permission strings: ${invalidPerms.join(", ")}`), { status: 400 });
    }
  }

  const update: Record<string, unknown> = {};
  if (role) update.role = role;
  if (permissions !== undefined) update.permissions = permissions;

  if (Object.keys(update).length === 0) {
    throw Object.assign(new Error("Nothing to update"), { status: 400 });
  }

  const updated = await StoreMemberModel.findOneAndUpdate(
    { _id: memberId, storeId },
    { $set: update },
    { new: true },
  ).select("-inviteToken").lean();

  if (!updated) throw Object.assign(new Error("Member not found"), { status: 404 });
  return updated;
}

/**
 * Update a member's status (active, suspended, revoked).
 */
export async function updateMemberStatus(input: MemberStatusInput) {
  const { storeId, memberId, status, currentUserPermissions } = input;

  assertCanManageMembers(currentUserPermissions);

  await connectDatabase();
  await assertNotOwner(storeId, memberId);

  const update: Record<string, unknown> = { status };
  const updated = await StoreMemberModel.findOneAndUpdate(
    { _id: memberId, storeId },
    { $set: update },
    { new: true },
  ).select("-inviteToken").lean();

  if (!updated) throw Object.assign(new Error("Member not found"), { status: 404 });
  return updated;
}

/**
 * Remove/revoke a member from the store.
 */
export async function removeStoreMember(storeId: string, memberId: string, currentUserPermissions: string[]) {
  assertCanManageMembers(currentUserPermissions);
  await connectDatabase();
  await assertNotOwner(storeId, memberId);

  const result = await StoreMemberModel.findOneAndDelete({ _id: memberId, storeId });
  if (!result) throw Object.assign(new Error("Member not found"), { status: 404 });
  return { ok: true };
}

/**
 * Resend invite email for a pending invitation.
 */
export async function resendMemberInvite(storeId: string, memberId: string, currentUserPermissions: string[]) {
  assertCanManageMembers(currentUserPermissions);
  await connectDatabase();

  const member = await StoreMemberModel.findOne({ _id: memberId, storeId, status: "invited" })
    .select("email name role")
    .lean() as { email: string; name: string; role: string } | null;

  if (!member) throw Object.assign(new Error("Pending invitation not found"), { status: 404 });

  const token = generateInviteToken();
  await StoreMemberModel.updateOne(
    { _id: memberId, storeId },
    { $set: { inviteToken: token, inviteExpiresAt: inviteTokenExpiry() } },
  );

  await sendInviteEmail({ storeId, email: member.email, name: member.name || member.email, token, role: member.role });
  return { ok: true, message: "Invitation resent" };
}

/**
 * Validate an invite token and return invite metadata.
 */
export async function validateInviteToken(token: string) {
  await connectDatabase();

  const member = await StoreMemberModel.findOne({ inviteToken: token, status: "invited" })
    .select("email name role storeId inviteExpiresAt")
    .populate("storeId", "name slug logoUrl")
    .lean() as {
      email: string;
      name: string;
      role: string;
      storeId: unknown;
      inviteExpiresAt: Date;
    } | null;

  if (!member) throw Object.assign(new Error("Invalid or expired invitation token"), { status: 404 });
  if (new Date() > new Date(member.inviteExpiresAt)) {
    throw Object.assign(new Error("This invitation has expired. Please ask the store owner to resend it."), { status: 410 });
  }

  return member;
}

/**
 * Accept an invite — provision or link user, activate membership.
 */
export async function acceptInvite(token: string, payload: { password?: string; name?: string; userId?: string }) {
  await connectDatabase();

  const invite = await StoreMemberModel.findOne({ inviteToken: token, status: "invited" })
    .select("email name role storeId tenantId inviteExpiresAt userId")
    .lean() as {
      _id: unknown;
      email: string;
      name: string;
      role: string;
      storeId: unknown;
      tenantId: unknown;
      inviteExpiresAt: Date;
      userId: unknown;
    } | null;

  if (!invite) throw Object.assign(new Error("Invalid or already-used invitation"), { status: 404 });
  if (new Date() > new Date(invite.inviteExpiresAt)) {
    throw Object.assign(new Error("This invitation has expired"), { status: 410 });
  }

  let userId: string;

  if (payload.userId) {
    // Existing logged-in user accepting the invite
    const user = await UserModel.findById(payload.userId).select("_id status").lean() as { _id: unknown; status: string } | null;
    if (!user || user.status !== "active") throw Object.assign(new Error("User account not found or inactive"), { status: 400 });
    userId = String(user._id);
  } else {
    // New user: create account with provided password
    if (!payload.password || payload.password.length < 8) {
      throw Object.assign(new Error("Password must be at least 8 characters"), { status: 400 });
    }
    const existing = await UserModel.findOne({ email: invite.email }).select("_id").lean() as { _id: unknown } | null;
    if (existing) {
      userId = String(existing._id);
    } else {
      const passwordHash = await bcrypt.hash(payload.password, 12);
      const user = await UserModel.create({
        email: invite.email,
        name: payload.name || invite.name || invite.email,
        passwordHash,
        tenantId: invite.tenantId,
        role: "viewer", // platform role — store role is in StoreMember
        status: "active",
      });
      userId = String(user._id);
    }
  }

  await StoreMemberModel.updateOne(
    { _id: invite._id },
    {
      $set: {
        userId,
        status: "active",
        acceptedAt: new Date(),
        inviteToken: null,
        inviteExpiresAt: null,
      },
    },
  );

  return { ok: true, userId };
}
