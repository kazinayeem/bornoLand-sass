import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Account — BornoLand",
  description: "Create your BornoLand Business Operating System account.",
};

export default function RegisterPage() {
  return (
    <AuthShell variant="register">
      <RegisterForm />
    </AuthShell>
  );
}
