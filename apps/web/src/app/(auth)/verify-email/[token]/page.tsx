import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <AuthShell variant="login">
      <AuthCard title="Verify your email" description="Confirm your email address to activate your account.">
        <VerifyEmailForm token={token} />
      </AuthCard>
    </AuthShell>
  );
}
