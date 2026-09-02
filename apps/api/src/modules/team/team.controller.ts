import type { Response } from "express";
import type { PermissionRequest } from "../../common/middleware/store-permission.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  listStoreMembers,
  inviteStoreMember,
  updateStoreMember,
  updateMemberStatus,
  removeStoreMember,
  resendMemberInvite,
  getEffectiveUserPermissions,
  validateInviteToken,
  acceptInvite,
} from "./team.service.js";
import {
  inviteMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
  acceptInviteSchema,
} from "./team.validator.js";

// ── Helper to extract error details ──────────────────────────────────────────

function handleServiceError(res: Response, err: unknown) {
  const e = err as { message?: string; status?: number; code?: string; [k: string]: unknown };
  const status = e.status ?? 500;
  const extra: Record<string, unknown> = {};
  if (e.code) extra.code = e.code;
  if (e.requiredUpgrade) extra.requiredUpgrade = true;
  if (e.current !== undefined) extra.current = e.current;
  if (e.limit !== undefined) extra.limit = e.limit;
  return res.status(status).json({ success: false, message: e.message ?? "Internal server error", ...extra });
}

// ─── List Store Members ───────────────────────────────────────────────────────

export async function listStoreMembersController(req: PermissionRequest, res: Response) {
  try {
    const storeId = req.storeContext!.storeId;
    const members = await listStoreMembers(storeId);
    return sendSuccess(res, { members });
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Invite Member ────────────────────────────────────────────────────────────

export async function inviteStoreMemberController(req: PermissionRequest, res: Response) {
  try {
    const parsed = inviteMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(res, parsed.error.errors.map((e) => e.message).join("; "), 400);
    }

    const { storeId, tenantId, memberPermissions } = req.storeContext!;
    const invitedById = req.user!.userId;

    const result = await inviteStoreMember({
      storeId,
      tenantId,
      invitedById,
      ...parsed.data,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Update Member Role / Permissions ─────────────────────────────────────────

export async function updateStoreMemberController(req: PermissionRequest, res: Response) {
  try {
    const parsed = updateMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(res, parsed.error.errors.map((e) => e.message).join("; "), 400);
    }

    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = req.params.memberId!;
    const currentUserId = req.user!.userId;

    const updated = await updateStoreMember({
      storeId,
      memberId,
      currentUserId,
      currentUserPermissions: memberPermissions,
      ...parsed.data,
    });

    return sendSuccess(res, { member: updated });
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Update Member Status (suspend / reactivate / revoke) ────────────────────

export async function updateMemberStatusController(req: PermissionRequest, res: Response) {
  try {
    const parsed = updateMemberStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(res, parsed.error.errors.map((e) => e.message).join("; "), 400);
    }

    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = req.params.memberId!;
    const currentUserId = req.user!.userId;

    const updated = await updateMemberStatus({
      storeId,
      memberId,
      currentUserId,
      currentUserPermissions: memberPermissions,
      status: parsed.data.status,
    });

    return sendSuccess(res, { member: updated });
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Remove Member ────────────────────────────────────────────────────────────

export async function removeStoreMemberController(req: PermissionRequest, res: Response) {
  try {
    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = req.params.memberId!;

    await removeStoreMember(storeId, memberId, memberPermissions);
    return sendSuccess(res, null, "Member removed");
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Resend Invite ────────────────────────────────────────────────────────────

export async function resendMemberInviteController(req: PermissionRequest, res: Response) {
  try {
    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = req.params.memberId!;

    const result = await resendMemberInvite(storeId, memberId, memberPermissions);
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Get My Permissions ───────────────────────────────────────────────────────

export async function getMyStorePermissionsController(req: PermissionRequest, res: Response) {
  try {
    const storeId = req.params.storeId || req.params.id || (req.query.storeId as string);
    const userId = req.user!.userId;
    const data = await getEffectiveUserPermissions(storeId, userId);
    if (!data) return sendFailure(res, "You are not a member of this store", 403);
    return sendSuccess(res, data);
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Validate Invite Token (Public) ──────────────────────────────────────────

export async function validateInviteTokenController(req: PermissionRequest, res: Response) {
  try {
    const { token } = req.params;
    const data = await validateInviteToken(token);
    return sendSuccess(res, data);
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Accept Invite (Public) ───────────────────────────────────────────────────

export async function acceptInviteController(req: PermissionRequest, res: Response) {
  try {
    const parsed = acceptInviteSchema.safeParse({ ...req.body, token: req.params.token });
    if (!parsed.success) {
      return sendFailure(res, parsed.error.errors.map((e) => e.message).join("; "), 400);
    }

    const result = await acceptInvite(parsed.data.token, {
      password: parsed.data.password,
      name: parsed.data.name,
      userId: parsed.data.userId,
    });

    return sendSuccess(res, result, "Invitation accepted successfully");
  } catch (err) {
    return handleServiceError(res, err);
  }
}
