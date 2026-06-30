import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell variant="register">
      <AuthCard
        title="Create your workspace"
        description="Start a new tenant, invite your team, and publish your first store."
      >
        <RegisterForm />
      </AuthCard>
    </AuthShell>
  );
}
