import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <AuthCard title="Choose a new password" description="Use a strong password you have not used before.">
          <ResetPasswordForm token={token} />
        </AuthCard>
      </div>
    </main>
  );
}
