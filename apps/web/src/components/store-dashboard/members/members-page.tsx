"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Shield,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCw,
  Edit2,
  Trash2,
  Ban,
  UserCheck,
  Send,
  Loader2,
} from "lucide-react";
import {
  useGetStoreMembersQuery,
  useUpdateMemberMutation,
  useUpdateMemberStatusMutation,
  useRemoveMemberMutation,
  useResendInviteMutation,
  type StoreMember,
} from "@/redux/api/team-api";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { useHasPermission, useIsStoreOwner } from "@/features/session/hooks";
import { InviteMemberModal } from "@/components/store-dashboard/members/invite-member-modal";
import { MemberPermissionEditor } from "@/components/store-dashboard/members/member-permission-editor";
import { cn } from "@/lib/utils";

type MembersPageProps = {
  storeId: string;
  storeSlug: string;
};

export function MembersPage({ storeId, storeSlug }: MembersPageProps) {
  const [search, setSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StoreMember | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "manager" | "staff" | "viewer">("manager");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [actionMenuMemberId, setActionMenuMemberId] = useState<string | null>(null);

  const canManage = useHasPermission("members:manage");
  const isOwner = useIsStoreOwner();

  const { data: membersRes, isLoading, refetch } = useGetStoreMembersQuery(storeId);
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId);
  const staffFeature = getFeatureByKey(accessData?.data?.features ?? [], "staff");

  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateMemberStatusMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [resendInvite, { isLoading: isResending }] = useResendInviteMutation();

  const members = membersRes?.data?.members ?? [];

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        m.role.toLowerCase().includes(q)
    );
  }, [members, search]);

  const handleOpenEdit = (member: StoreMember) => {
    setEditingMember(member);
    setEditRole(member.role === "owner" ? "admin" : (member.role as any));
    setEditPermissions([...member.permissions]);
    setActionMenuMemberId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    try {
      await updateMember({
        storeId,
        memberId: editingMember._id,
        role: editRole,
        permissions: editPermissions,
      }).unwrap();
      setEditingMember(null);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to update member");
    }
  };

  const handleToggleStatus = async (member: StoreMember) => {
    setActionMenuMemberId(null);
    const newStatus = member.status === "active" ? "suspended" : "active";
    if (confirm(`Are you sure you want to ${newStatus === "suspended" ? "suspend" : "reactivate"} ${member.email}?`)) {
      try {
        await updateStatus({ storeId, memberId: member._id, status: newStatus }).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to update status");
      }
    }
  };

  const handleRemove = async (member: StoreMember) => {
    setActionMenuMemberId(null);
    if (confirm(`Are you sure you want to remove ${member.email} from this store?`)) {
      try {
        await removeMember({ storeId, memberId: member._id }).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to remove member");
      }
    }
  };

  const handleResend = async (member: StoreMember) => {
    setActionMenuMemberId(null);
    try {
      await resendInvite({ storeId, memberId: member._id }).unwrap();
      alert("Invitation resent successfully!");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to resend invitation");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Team Members & RBAC
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Control member roles, granular resource permissions, and staff invitations.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Plan Limit Banner if applicable */}
      {staffFeature && staffFeature.limit > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />
            <span className="text-zinc-700 dark:text-zinc-300">
              Staff capacity: <strong className="text-zinc-950 dark:text-white">{members.length}</strong> / {staffFeature.limit} members
            </span>
          </div>
          {members.length >= staffFeature.limit && (
            <a
              href={`/store/${storeSlug}/billing`}
              className="font-semibold text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
            >
              Upgrade plan for more seats
            </a>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-xl border border-zinc-200/80 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          title="Refresh"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      {/* Members List Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {search ? "No members matching your search" : "No team members yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <th className="px-5 py-3.5 font-medium">Member</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Permissions</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Joined / Invited</th>
                  {canManage && <th className="px-5 py-3.5 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredMembers.map((member) => {
                  const isOwnerMember = member.role === "owner";
                  const statusColors = {
                    active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                    invited: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                    suspended: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                    revoked: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
                  };

                  return (
                    <tr key={member._id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {(member.name || member.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                              {member.name || member.email.split("@")[0]}
                            </p>
                            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                            isOwnerMember
                              ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                              : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                          )}
                        >
                          {isOwnerMember && <Shield className="h-3 w-3" />}
                          {member.role}
                        </span>
                      </td>

                      {/* Permissions Summary */}
                      <td className="px-5 py-4">
                        {isOwnerMember ? (
                          <span className="text-[11px] text-zinc-500">All permissions (Owner)</span>
                        ) : member.permissions.includes("*") ? (
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            All permissions (*)
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                            {member.permissions.length} granular rules
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                            statusColors[member.status] || statusColors.active
                          )}
                        >
                          {member.status === "active" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {member.status === "invited" && <Clock className="h-2.5 w-2.5" />}
                          {member.status === "suspended" && <AlertCircle className="h-2.5 w-2.5" />}
                          {member.status === "revoked" && <XCircle className="h-2.5 w-2.5" />}
                          {member.status}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {member.acceptedAt
                          ? new Date(member.acceptedAt).toLocaleDateString()
                          : member.invitedAt
                          ? `Invited ${new Date(member.invitedAt).toLocaleDateString()}`
                          : new Date(member.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action dropdown */}
                      {canManage && (
                        <td className="px-5 py-4 text-right">
                          {!isOwnerMember && (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuMemberId(actionMenuMemberId === member._id ? null : member._id)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {actionMenuMemberId === member._id && (
                                <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in zoom-in-95">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    <span>Edit Permissions</span>
                                  </button>

                                  {member.status === "invited" && (
                                    <button
                                      type="button"
                                      onClick={() => handleResend(member)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                    >
                                      <Send className="h-3.5 w-3.5" />
                                      <span>Resend Invite</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                  >
                                    {member.status === "active" ? (
                                      <>
                                        <Ban className="h-3.5 w-3.5 text-amber-600" />
                                        <span>Suspend Member</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Reactivate Member</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                                  <button
                                    type="button"
                                    onClick={() => handleRemove(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Remove Member</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        storeId={storeId}
      />

      {/* Edit Permissions Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={() => setEditingMember(null)} />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Edit Member Permissions
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {editingMember.name || editingMember.email} ({editingMember.role})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <MemberPermissionEditor
                selectedPermissions={editPermissions}
                onChange={setEditPermissions}
                role={editingMember.role}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 p-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
