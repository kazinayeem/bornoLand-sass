import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell variant="recovery">
      <AuthCard
        title="Reset your password"
        description="Enter your email and we will send you a secure reset link."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}
