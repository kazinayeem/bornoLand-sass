import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password — BornoLand",
  description: "Reset your BornoLand account password securely.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell variant="recovery">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
