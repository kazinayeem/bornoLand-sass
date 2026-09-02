import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  requireStoreAccess,
  requireStorePermission,
} from "../../common/middleware/store-permission.middleware.js";
import {
  listStoreMembersController,
  inviteStoreMemberController,
  updateStoreMemberController,
  updateMemberStatusController,
  removeStoreMemberController,
  resendMemberInviteController,
  sendMemberPasswordResetController,
  getMyStorePermissionsController,
  validateInviteTokenController,
  acceptInviteController,
} from "./team.controller.js";

export const teamRouter: Router = Router();

// ─── Authenticated store-scoped routes (:storeId) ─────────────────────────────

/**
 * GET  /stores/:storeId/members         → list all members (requires members:read)
 * POST /stores/:storeId/members         → invite member    (requires members:manage)
 */
teamRouter.get(
  "/stores/:storeId/members",
  requireAuth,
  requireStorePermission("members:read"),
  listStoreMembersController,
);

teamRouter.post(
  "/stores/:storeId/members",
  requireAuth,
  requireStorePermission("members:manage"),
  inviteStoreMemberController,
);

/**
 * PATCH  /stores/:storeId/members/:memberId        → update role / permissions
 * PATCH  /stores/:storeId/members/:memberId/status → update status
 * DELETE /stores/:storeId/members/:memberId        → remove member
 * POST   /stores/:storeId/members/:memberId/resend → resend invite
 */
teamRouter.patch(
  "/stores/:storeId/members/:memberId",
  requireAuth,
  requireStorePermission("members:manage"),
  updateStoreMemberController,
);

teamRouter.patch(
  "/stores/:storeId/members/:memberId/status",
  requireAuth,
  requireStorePermission("members:manage"),
  updateMemberStatusController,
);

teamRouter.delete(
  "/stores/:storeId/members/:memberId",
  requireAuth,
  requireStorePermission("members:manage"),
  removeStoreMemberController,
);

teamRouter.post(
  "/stores/:storeId/members/:memberId/resend",
  requireAuth,
  requireStorePermission("members:manage"),
  resendMemberInviteController,
);

teamRouter.post(
  "/stores/:storeId/members/:memberId/reset-password",
  requireAuth,
  requireStorePermission("members:manage"),
  sendMemberPasswordResetController,
);

/**
 * GET /stores/:storeId/members/me/permissions → get calling user's permissions in a store
 */
teamRouter.get(
  "/stores/:storeId/members/me/permissions",
  requireAuth,
  requireStoreAccess,
  getMyStorePermissionsController,
);

// ─── Public invite acceptance routes ──────────────────────────────────────────

/**
 * GET  /invite/:token → validate invite token (public)
 * POST /invite/:token → accept invitation   (public)
 */
teamRouter.get("/invite/:token", validateInviteTokenController);
teamRouter.post("/invite/:token", acceptInviteController);
