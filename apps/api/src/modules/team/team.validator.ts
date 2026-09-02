import { z } from "zod";
import { STORE_MODULES, STORE_ACTIONS } from "../../common/types/permissions.js";

// A valid permission string: "*", "module:*", or "module:action"
const permissionString = z.string().refine((p) => {
  if (p === "*") return true;
  const parts = p.split(":");
  if (parts.length !== 2) return false;
  const [mod, act] = parts;
  const validMod = (STORE_MODULES as readonly string[]).includes(mod);
  const validAct = act === "*" || (STORE_ACTIONS as readonly string[]).includes(act);
  return validMod && validAct;
}, "Invalid permission string. Use format 'module:action' or 'module:*'");

export const INVITABLE_ROLES = ["admin", "manager", "staff", "viewer", "cashier"] as const;

export const inviteMemberSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().max(100).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(INVITABLE_ROLES),
  permissions: z.array(permissionString).optional().default([]),
});

export const updateMemberSchema = z.object({
  role: z.enum(INVITABLE_ROLES).optional(),
  permissions: z.array(permissionString).optional(),
});

export const updateMemberStatusSchema = z.object({
  status: z.enum(["active", "suspended", "revoked"]),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  name: z.string().max(100).optional(),
  userId: z.string().optional(),
}).refine((d) => d.userId || d.password, {
  message: "Either userId (logged-in user) or password (new user) is required",
});

export type InviteMemberBody = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberBody = z.infer<typeof updateMemberSchema>;
export type UpdateMemberStatusBody = z.infer<typeof updateMemberStatusSchema>;
export type AcceptInviteBody = z.infer<typeof acceptInviteSchema>;
