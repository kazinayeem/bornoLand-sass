import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <AuthShell variant="recovery">
      <AuthCard title="Choose a new password" description="Use a strong password you have not used before.">
        <ResetPasswordForm token={token} />
      </AuthCard>
    </AuthShell>
  );
}
