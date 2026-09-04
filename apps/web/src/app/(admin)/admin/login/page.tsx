import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Super Admin Login — BornoLand",
  description: "BornoLand platform administration portal.",
};

export default function AdminLoginPage() {
  return (
    <AuthShell variant="login">
      <LoginForm loginType="admin" />
    </AuthShell>
  );
}
