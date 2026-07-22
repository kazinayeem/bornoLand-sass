"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { Button } from "@/components/ui/button";
import { useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { useChangeCustomerPasswordMutation } from "@/redux/api/customer-api";
import { useAppDispatch } from "@/hooks/redux";
import { clearCustomer, setCustomerFromToken } from "@/redux/slices/customer-slice";

function strengthScore(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return Math.min(5, score);
}

function strengthLabel(score: number) {
  if (score <= 1) return "Weak";
  if (score <= 3) return "Good";
  return "Strong";
}

export default function PasswordAccountPage() {
  const dispatch = useAppDispatch();
  const { classes } = useStorefrontSurface();

  const [changePassword, { isLoading }] = useChangeCustomerPasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const score = useMemo(() => strengthScore(newPassword), [newPassword]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      const res = await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
      const token = res.data?.token;
      if (token) {
        localStorage.setItem("customer_token", token);
        dispatch(setCustomerFromToken(token));
      } else {
        dispatch(clearCustomer());
        localStorage.removeItem("customer_token");
      }
      toast.success("Password updated");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Could not update password");
    }
  };

  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Update your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Current Password"
              value={currentPassword}
              type={showCurrent ? "text" : "password"}
              onChange={setCurrentPassword}
              right={showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onToggle={() => setShowCurrent((v) => !v)}
              classes={classes}
            />

            <Field
              label="New Password"
              value={newPassword}
              type={showNew ? "text" : "password"}
              onChange={setNewPassword}
              right={showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onToggle={() => setShowNew((v) => !v)}
              classes={classes}
            />
          </div>

          <Field
            label="Confirm Password"
            value={confirmPassword}
            type={showConfirm ? "text" : "password"}
            onChange={setConfirmPassword}
            right={showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onToggle={() => setShowConfirm((v) => !v)}
            classes={classes}
          />

          <div className="rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Password strength</p>
              <span className="text-xs font-semibold" style={{ color: "#111111" }}>
                {strengthLabel(score)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full"
                  style={{ backgroundColor: i <= score ? "#111111" : "#E5E7EB" }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs" style={{ color: "#6B7280" }}>
              Use 8+ characters, a mix of cases and numbers.
            </p>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            loadingKey="save"
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            Update password
          </Button>
        </form>
      </div>
    </CustomerAccountShell>
  );
}

function Field({
  label,
  value,
  type,
  onChange,
  right,
  onToggle,
  classes,
}: {
  label: string;
  value: string;
  type: string;
  onChange: (v: string) => void;
  right: ReactNode;
  onToggle: () => void;
  classes: { inputCompact: string };
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="relative">
        <input
          className={`${classes.inputCompact} pr-10`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
          aria-label={type === "password" ? "Show password" : "Hide password"}
        >
          {right}
        </button>
      </div>
    </label>
  );
}
