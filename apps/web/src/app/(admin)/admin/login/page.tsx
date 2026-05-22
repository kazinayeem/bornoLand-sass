import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <AuthCard title="Super admin login" description="Administrative access for platform operators and internal support teams.">
          <LoginForm loginType="admin" />
        </AuthCard>
      </div>
    </main>
  );
}