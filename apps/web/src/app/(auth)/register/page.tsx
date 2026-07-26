import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell variant="register">
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>
      </div>
    </AuthShell>
  );
}
