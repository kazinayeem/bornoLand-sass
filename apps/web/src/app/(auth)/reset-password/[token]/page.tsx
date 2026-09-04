import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Create New Password — BornoLand",
  description: "Set a new secure password for your BornoLand account.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthShell variant="recovery">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
