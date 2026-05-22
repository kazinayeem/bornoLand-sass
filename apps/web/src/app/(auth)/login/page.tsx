import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <AuthCard title="Welcome back" description="Sign in to your tenant dashboard and continue building your landing pages.">
          <LoginForm />
        </AuthCard>
      </div>
    </main>
  );
}