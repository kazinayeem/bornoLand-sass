import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "@/lib/auth-session";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect(session.loginType === "admin" ? "/admin/dashboard" : "/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <AuthCard title="Welcome back" description="Sign in to your tenant dashboard and continue building your landing pages.">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}