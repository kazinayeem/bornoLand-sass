import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <AuthCard title="Reset your password" description="Enter your email and we will send you a secure reset link.">
          <ForgotPasswordForm />
        </AuthCard>
      </div>
    </main>
  );
}
