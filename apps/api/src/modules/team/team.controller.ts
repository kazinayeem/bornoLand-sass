import type { Response } from "express";
import type { PermissionRequest } from "../../common/middleware/store-permission.middleware.js";
import {
  inviteMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
  acceptInviteSchema,
} from "./team.validator.js";
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
  TeamServiceError,
} from "./team.service.js";

// Helper for consistent response envelope
function sendSuccess(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}

function sendFailure(res: Response, message: string, status = 400, code?: string) {
  return res.status(status).json({ success: false, message, code });
}

function handleServiceError(res: Response, err: unknown) {
  if (err instanceof TeamServiceError) {
    return sendFailure(res, err.message, err.statusCode, err.code);
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  return sendFailure(res, message, 500, "INTERNAL_ERROR");
}

// ─── List Members ─────────────────────────────────────────────────────────────

export async function listStoreMembersController(req: PermissionRequest, res: Response) {
  try {
    const { storeId } = req.storeContext!;
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
      return sendFailure(res, parsed.error.issues.map((e) => e.message).join("; "), 400);
    }

    const { storeId, tenantId } = req.storeContext!;
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
      return sendFailure(res, parsed.error.issues.map((e) => e.message).join("; "), 400);
    }

    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = String(req.params.memberId);
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
      return sendFailure(res, parsed.error.issues.map((e) => e.message).join("; "), 400);
    }

    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = String(req.params.memberId);
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
    const memberId = String(req.params.memberId);

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
    const memberId = String(req.params.memberId);

    const result = await resendMemberInvite(storeId, memberId, memberPermissions);
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Trigger Member Password Reset ───────────────────────────────────────────

export async function sendMemberPasswordResetController(req: PermissionRequest, res: Response) {
  try {
    const { storeId, memberPermissions } = req.storeContext!;
    const memberId = String(req.params.memberId);

    const result = await (await import("./team.service.js")).sendMemberPasswordReset(storeId, memberId, memberPermissions);
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(res, err);
  }
}

// ─── Get My Permissions ───────────────────────────────────────────────────────

export async function getMyStorePermissionsController(req: PermissionRequest, res: Response) {
  try {
    const storeId = String(req.params.storeId || req.params.id || req.query.storeId);
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
    const token = String(req.params.token);
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
      return sendFailure(res, parsed.error.issues.map((e) => e.message).join("; "), 400);
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
