import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <AuthCard title="Create your workspace" description="Start a new tenant, invite your team, and publish your first landing page.">
          <RegisterForm />
        </AuthCard>
      </div>
    </main>
  );
}
