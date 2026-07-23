import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-10">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <div className="w-full max-w-sm">
        <LoginForm loginType="admin" />
      </div>
    </main>
  );
}
