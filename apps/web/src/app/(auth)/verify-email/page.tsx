import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata = {
  title: "Verify Email — BornoLand",
  description: "Confirm your email address to activate your BornoLand account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell variant="verify">
      <VerifyEmailForm />
    </AuthShell>
  );
}
