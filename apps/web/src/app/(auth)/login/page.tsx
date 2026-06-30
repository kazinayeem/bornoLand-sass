import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell variant="login">
      <AuthCard
        title="Welcome back"
        description="Sign in to your workspace dashboard and continue building your stores."
      >
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
