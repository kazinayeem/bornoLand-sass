"use client";

import { useState } from "react";
import {
  X,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useInviteMemberMutation } from "@/redux/api/team-api";
import { MemberPermissionEditor } from "@/components/store-dashboard/members/member-permission-editor";
import { cn } from "@/lib/utils";

const ROLE_PRESETS = [
  {
    id: "admin",
    name: "Admin",
    description: "Full management access to catalog, sales, and settings",
    permissions: [
      "products:*",
      "categories:*",
      "inventory:*",
      "orders:*",
      "customers:*",
      "coupons:*",
      "reviews:*",
      "pages:*",
      "media:*",
      "analytics:read",
      "analytics:export",
      "settings:read",
      "settings:update",
      "members:read",
      "marketing:*",
      "shipping:*",
      "payments:read",
      "reports:read",
      "reports:export",
    ],
  },
  {
    id: "manager",
    name: "Store Manager",
    description: "Daily operations: orders, products, inventory, and customer support",
    permissions: [
      "products:*",
      "categories:read",
      "categories:update",
      "inventory:read",
      "inventory:update",
      "orders:*",
      "customers:read",
      "customers:update",
      "reviews:read",
      "reviews:update",
      "media:read",
      "media:create",
      "analytics:read",
      "marketing:read",
      "marketing:create",
      "marketing:update",
      "shipping:read",
      "reports:read",
    ],
  },
  {
    id: "staff",
    name: "Staff / Cashier",
    description: "Order processing, POS cashiering, and catalog viewing",
    permissions: [
      "products:read",
      "products:create",
      "products:update",
      "categories:read",
      "inventory:read",
      "orders:read",
      "orders:update",
      "customers:read",
      "media:read",
      "media:create",
    ],
  },
  {
    id: "viewer",
    name: "Viewer / Analyst",
    description: "Read-only access to orders, products, and analytics reports",
    permissions: [
      "products:read",
      "categories:read",
      "inventory:read",
      "orders:read",
      "customers:read",
      "analytics:read",
      "reports:read",
    ],
  },
] as const;

function generateSecurePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + numbers + special;

  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return pwd
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
};

export function InviteMemberModal({ isOpen, onClose, storeId }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<"admin" | "manager" | "staff" | "viewer">("manager");
  const [permissions, setPermissions] = useState<string[]>([...ROLE_PRESETS[1].permissions]);
  const [showCustomPerms, setShowCustomPerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  if (!isOpen) return null;

  const handleRoleChange = (selectedRole: "admin" | "manager" | "staff" | "viewer") => {
    setRole(selectedRole);
    const preset = ROLE_PRESETS.find((r) => r.id === selectedRole);
    if (preset) {
      setPermissions([...preset.permissions]);
    }
  };

  const handleGeneratePassword = () => {
    const pwd = generateSecurePassword(12);
    setPassword(pwd);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await inviteMember({
        storeId,
        email: email.trim(),
        name: name.trim() || undefined,
        password: password.trim() || undefined,
        role,
        permissions,
      }).unwrap();

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message || "Failed to create member account.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Failed to create member account. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Add Team Member</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create an account or assign a member to this store with specific roles and permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Email & Full Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Full Name <span className="text-zinc-400 text-[10px]">(Optional)</span>
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Initial Password Section */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Initial Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 underline hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                <Sparkles className="h-3 w-3" />
                <span>Generate Password</span>
              </button>
            </div>

            <div className="relative mt-1.5">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-20 text-xs outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    title="Copy Password"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              The member can log in immediately with this email and password, and change it anytime under Settings.
            </p>
          </div>

          {/* Role Presets */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Role Preset
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ROLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleRoleChange(p.id)}
                  className={cn(
                    "flex flex-col rounded-xl border p-3 text-left transition-all",
                    role === p.id
                      ? "border-zinc-900 bg-zinc-900/5 dark:border-white/30 dark:bg-white/5"
                      : "border-zinc-200/80 bg-zinc-50/30 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    {role === p.id && <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />}
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Granular Permissions</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {permissions.length} permissions enabled for this member
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomPerms(!showCustomPerms)}
                className="text-xs font-medium text-zinc-700 underline hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                {showCustomPerms ? "Collapse" : "Customize Permissions"}
              </button>
            </div>

            {showCustomPerms && (
              <div className="mt-4">
                <MemberPermissionEditor
                  selectedPermissions={permissions}
                  onChange={setPermissions}
                  role={role}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Create Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { InviteMemberModal as AddMemberModal };
