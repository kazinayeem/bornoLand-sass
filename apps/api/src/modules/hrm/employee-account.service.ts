import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import {
  roleToPermissions,
  STORE_MEMBER_ROLES,
  type StoreMemberRole,
} from "../../common/types/permissions.js";
import { sendEmail } from "../../common/integrations/email.js";
import { getWebUrl } from "../../common/utils/app-url.js";
import { UserModel } from "../users/user.model.js";
import { StoreModel } from "../stores/store.model.js";
import { StoreMemberModel } from "../team/store-member.model.js";
import { EmployeeModel } from "./employee.model.js";
import {
  resolveStoreFeature,
  resolveStoreLimit,
} from "../stores/store-override.service.js";

/** HR statuses that may authenticate into their assigned store. */
export const EMPLOYEE_LOGIN_ALLOWED_STATUSES = ["active", "on_leave"] as const;

export type EmployeeLoginAccount = {
  created: boolean;
  linked: boolean;
  email: string;
  role: StoreMemberRole;
  storeId: string;
  mustChangePassword: boolean;
  userId: string;
};

export class EmployeeAccountError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "EmployeeAccountError";
    this.statusCode = statusCode;
  }
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return String(value || "").trim();
}

export function phoneDigits(value: string) {
  return normalizePhone(value).replace(/[^\d]/g, "");
}

export function isEmployeeStatusAllowedForLogin(status?: string | null) {
  return EMPLOYEE_LOGIN_ALLOWED_STATUSES.includes(
    String(status || "").toLowerCase() as (typeof EMPLOYEE_LOGIN_ALLOWED_STATUSES)[number],
  );
}

export function isAssignableEmployeeRole(role: string): role is StoreMemberRole {
  return STORE_MEMBER_ROLES.includes(role as StoreMemberRole) && role !== "owner";
}

function isDuplicateKeyError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000);
}

/**
 * Resolve a login identifier that is not an email to a User via Employee.userId.
 * Employee codes are unique per store, so multiple matches must share one User.
 */
export async function findUserIdByEmployeeIdentifier(rawIdentifier: string): Promise<string | null> {
  const identifier = String(rawIdentifier || "").trim();
  if (!identifier) return null;

  const codeMatches = await EmployeeModel.find({
    employeeCode: new RegExp(`^${escapeRegex(identifier)}$`, "i"),
  })
    .select("userId email storeId status")
    .lean();

  if (codeMatches.length > 0) {
    const userIds = [
      ...new Set(codeMatches.map((row) => (row.userId ? String(row.userId) : "")).filter(Boolean)),
    ];
    if (userIds.length > 1) {
      throw new EmployeeAccountError("Employee ID is ambiguous. Sign in with your email address.", 401);
    }
    if (userIds.length === 1) return userIds[0];

    const emails = [...new Set(codeMatches.map((row) => normalizeEmail(String(row.email || ""))).filter(Boolean))];
    if (emails.length === 1) {
      const user = (await UserModel.findOne({ email: emails[0] }).select("_id").lean()) as { _id?: unknown } | null;
      if (user?._id) {
        await EmployeeModel.updateMany(
          {
            _id: { $in: codeMatches.map((row) => row._id) },
            $or: [{ userId: null }, { userId: { $exists: false } }],
          },
          { $set: { userId: user._id } },
        );
        return String(user._id);
      }
    }
    return null;
  }

  const digits = phoneDigits(identifier);
  if (digits.length >= 10 && digits.length <= 15) {
    const phoneMatches = await EmployeeModel.find({
      $or: [
        { phone: identifier },
        { phone: digits },
        { phone: { $regex: new RegExp(`${escapeRegex(digits)}$`) } },
      ],
    })
      .select("userId email phone status")
      .lean();

    const userIds = [
      ...new Set(phoneMatches.map((row) => (row.userId ? String(row.userId) : "")).filter(Boolean)),
    ];
    if (userIds.length > 1) {
      throw new EmployeeAccountError("This phone number matches multiple accounts. Sign in with your email.", 401);
    }
    if (userIds.length === 1) return userIds[0];
  }

  return null;
}

export async function assertEmployeeMayAuthenticate(
  userId: string,
  email?: string,
  userRole?: string,
) {
  if (userRole === "super_admin" || userRole === "owner" || userRole === "admin") {
    return { blocked: false as const, employees: [] as Array<{ status?: string; storeId?: unknown; userId?: unknown }> };
  }

  const employees = await EmployeeModel.find({
    $or: [{ userId }, ...(email ? [{ email: normalizeEmail(email) }] : [])],
  })
    .select("status storeId userId")
    .lean();

  if (employees.length === 0) return { blocked: false as const, employees };

  const allowed = employees.filter((row) => isEmployeeStatusAllowedForLogin(row.status));
  if (allowed.length > 0) {
    return { blocked: false as const, employees: allowed };
  }

  const blockedStoreIds = new Set(employees.map((row) => String(row.storeId)));
  const memberStoreIds = (await StoreMemberModel.find({ userId, status: "active" }).distinct("storeId")).map((id) =>
    String(id),
  );
  const otherMemberships = memberStoreIds.filter((storeId) => !blockedStoreIds.has(storeId));
  const ownedStore = await StoreModel.exists({ userId, status: { $ne: "archived" } });
  if (otherMemberships.length === 0 && !ownedStore) {
    throw new EmployeeAccountError("This employee account is no longer active.", 401);
  }
  return { blocked: false as const, employees: [] };
}

export async function listActiveMembershipStoreIds(userId: string) {
  const { employees } = await assertEmployeeMayAuthenticate(userId);

  const memberStoreIds = (
    await StoreMemberModel.find({ userId, status: "active" }).distinct("storeId")
  ).map((id) => String(id));

  if (employees.length === 0) {
    return memberStoreIds;
  }

  const allowedByHr = new Set(employees.map((row) => String(row.storeId)));
  return memberStoreIds.filter((storeId) => {
    const hrRecord = employees.find((row) => String(row.storeId) === storeId);
    if (!hrRecord) return true;
    return allowedByHr.has(storeId);
  });
}

export async function assertEmployeeCanAccessStore(storeId: string, userId: string, email?: string) {
  const employee = (await EmployeeModel.findOne({
    storeId,
    $or: [{ userId }, ...(email ? [{ email: normalizeEmail(email) }] : [])],
  })
    .select("status userId")
    .lean()) as { status?: string; userId?: unknown } | null;

  if (!employee) return;
  if (!isEmployeeStatusAllowedForLogin(employee.status)) {
    throw new EmployeeAccountError("This employee account is no longer active in this store.", 403);
  }
}

async function sendEmployeeLoginReadyEmail(input: {
  email: string;
  name: string;
  storeName: string;
  employeeCode: string;
}) {
  const loginUrl = `${getWebUrl()}/login`;
  await sendEmail({
    to: input.email,
    subject: `Your ${input.storeName} employee login is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px">Your BornoLand login is ready</h2>
        <p>Hi ${input.name},</p>
        <p>An employee account has been created for you at <strong>${input.storeName}</strong>.</p>
        <p>Employee ID: <strong>${input.employeeCode}</strong></p>
        <p>Sign in at <a href="${loginUrl}">${loginUrl}</a> using this email address.</p>
        <p>Your temporary password is the <strong>mobile number registered on your employee profile</strong>. You will be asked to create a new password on first sign-in.</p>
        <p style="margin-top:24px;font-size:13px;color:#71717a">If you did not expect this message, contact your store administrator.</p>
      </div>
    `,
  });
}

export async function provisionEmployeeLoginAccount(input: {
  storeId: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  memberRole?: string;
  existingUserId?: string | null;
}): Promise<EmployeeLoginAccount> {
  await connectDatabase();

  const storeId = String(input.storeId);
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const name = `${input.firstName} ${input.lastName || ""}`.trim() || email.split("@")[0];
  const requestedRole = String(input.memberRole || "employee").toLowerCase().trim();
  const role: StoreMemberRole = isAssignableEmployeeRole(requestedRole) ? requestedRole : "employee";

  if (!email || !email.includes("@")) {
    throw new EmployeeAccountError("A valid employee email is required to create a login account.");
  }
  if (phoneDigits(phone).length < 8) {
    throw new EmployeeAccountError("A mobile number of at least 8 digits is required. It is used as the temporary password for new login accounts.");
  }

  const store = (await StoreModel.findById(storeId).select("_id tenantId userId name slug").lean()) as {
    _id: unknown;
    tenantId: unknown;
    userId: unknown;
    name?: string;
    slug?: string;
  } | null;
  if (!store) throw new EmployeeAccountError("Store not found.", 404);

  const staffFeatureEnabled = await resolveStoreFeature(storeId, "staffManagement");
  if (!staffFeatureEnabled) {
    throw new EmployeeAccountError("Staff management is not available on the current plan.", 403);
  }

  const staffLimit = await resolveStoreLimit(storeId, "staff");
  if (staffLimit > 0) {
    const currentCount = await StoreMemberModel.countDocuments({
      storeId,
      role: { $ne: "owner" },
      status: { $in: ["active", "invited"] },
    });
    if (currentCount >= staffLimit) {
      throw new EmployeeAccountError(
        `Staff member limit (${staffLimit}) has been reached for this plan.`,
        403,
      );
    }
  }

  const existingUser = (await UserModel.findOne({ email }).select("_id role status email tenantId").lean()) as {
    _id: unknown;
    role?: string;
    status?: string;
    tenantId?: unknown;
  } | null;

  if (existingUser?.role === "super_admin") {
    throw new EmployeeAccountError("This email belongs to a platform administrator and cannot be linked to an employee login.");
  }

  if (existingUser && input.existingUserId && String(input.existingUserId) !== String(existingUser._id)) {
    throw new EmployeeAccountError("This employee is already linked to a different user account.");
  }

  if (existingUser) {
    const sameTenant = Boolean(existingUser.tenantId) && String(existingUser.tenantId) === String(store.tenantId);
    const isThisStoreOwner = String(store.userId) === String(existingUser._id);
    const alreadyMember = await StoreMemberModel.exists({
      storeId,
      $or: [{ userId: existingUser._id }, { email }],
    });
    const explicitSameUser = Boolean(input.existingUserId) && String(input.existingUserId) === String(existingUser._id);
    const isMerchantAccount = existingUser.role === "owner" || existingUser.role === "admin";

    if (!sameTenant && !isThisStoreOwner && !alreadyMember && !explicitSameUser) {
      throw new EmployeeAccountError("This email belongs to an existing account in another workspace and cannot be linked.");
    }
    if (isMerchantAccount && !isThisStoreOwner && !alreadyMember) {
      throw new EmployeeAccountError("This email belongs to a merchant account and cannot be linked as an employee.");
    }
  }

  let userId = existingUser ? String(existingUser._id) : input.existingUserId ? String(input.existingUserId) : null;
  let createdUser = false;
  let createdMember = false;
  let mustChangePassword = false;

  try {
    if (!userId) {
      const passwordHash = await bcrypt.hash(phone, 12);
      const created = await UserModel.create({
        email,
        name,
        phone,
        passwordHash,
        tenantId: store.tenantId,
        role: "viewer",
        status: "active",
        provider: "credentials",
        mustChangePassword: true,
        emailVerifiedAt: new Date(),
      });
      userId = String(created._id);
      createdUser = true;
      mustChangePassword = true;
    } else {
      const userDoc = await UserModel.findById(userId).select("mustChangePassword phone status").lean() as {
        mustChangePassword?: boolean;
        phone?: string;
        status?: string;
      } | null;
      if (!userDoc || userDoc.status !== "active") {
        throw new EmployeeAccountError("The matching user account is not active and cannot be linked.");
      }
      mustChangePassword = Boolean(userDoc.mustChangePassword);
      if (!userDoc.phone && phone) {
        await UserModel.updateOne({ _id: userId }, { $set: { phone } });
      }
    }

    await EmployeeModel.updateOne({ _id: input.employeeId }, { $set: { userId, email, phone } });

    const isStoreOwner = String(store.userId) === userId;
    if (!isStoreOwner) {
      const existingMember = await StoreMemberModel.findOne({ storeId, email }).lean() as {
        _id: unknown;
        userId?: unknown;
        status?: string;
        role?: string;
      } | null;

      if (existingMember) {
        await StoreMemberModel.updateOne(
          { _id: existingMember._id },
          {
            $set: {
              userId,
              name,
              role,
              status: existingMember.status === "revoked" ? "active" : existingMember.status === "suspended" ? existingMember.status : "active",
              acceptedAt: new Date(),
              inviteToken: null,
              inviteExpiresAt: null,
            },
          },
        );
      } else {
        await StoreMemberModel.create({
          storeId,
          tenantId: store.tenantId,
          userId,
          email,
          name,
          role,
          permissions: [],
          status: "active",
          acceptedAt: new Date(),
        });
        createdMember = true;
      }
    }

    if (createdUser) {
      await sendEmployeeLoginReadyEmail({
        email,
        name,
        storeName: store.name || "your store",
        employeeCode: String(
          ((await EmployeeModel.findById(input.employeeId).select("employeeCode").lean()) as { employeeCode?: string } | null)
            ?.employeeCode || "",
        ),
      }).catch(() => undefined);
    }

    return {
      created: createdUser,
      linked: !createdUser,
      email,
      role: isStoreOwner ? "owner" : role,
      storeId,
      mustChangePassword,
      userId,
    };
  } catch (error) {
    if (createdMember) {
      await StoreMemberModel.deleteOne({ storeId, email, userId }).catch(() => undefined);
    }
    if (createdUser && userId) {
      await EmployeeModel.updateOne({ _id: input.employeeId }, { $unset: { userId: 1 } }).catch(() => undefined);
      await UserModel.deleteOne({ _id: userId }).catch(() => undefined);
    }
    if (error instanceof EmployeeAccountError) throw error;
    if (isDuplicateKeyError(error)) {
      throw new EmployeeAccountError("A login account or store membership already exists for this email.");
    }
    throw error;
  }
}

export async function syncMembershipForEmployeeStatus(storeId: string, employeeId: string, status: string) {
  const employee = await EmployeeModel.findOne({ _id: employeeId, storeId }).select("userId email").lean() as {
    userId?: unknown;
    email?: string;
  } | null;
  if (!employee?.userId) return;

  if (isEmployeeStatusAllowedForLogin(status)) {
    await StoreMemberModel.updateOne(
      { storeId, userId: employee.userId, status: "suspended" },
      { $set: { status: "active" } },
    );
    return;
  }

  await StoreMemberModel.updateOne(
    { storeId, userId: employee.userId, role: { $ne: "owner" }, status: "active" },
    { $set: { status: "suspended" } },
  );
}

export function employeeAccountPermissions(role: StoreMemberRole) {
  return roleToPermissions(role);
}

export function oidOrNull(id: string | mongoose.Types.ObjectId | null | undefined) {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}
