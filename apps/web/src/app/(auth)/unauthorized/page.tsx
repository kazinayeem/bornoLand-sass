import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ShieldAlert, ArrowRight, Store, LogIn } from "lucide-react";

export const metadata = {
  title: "Access Restricted — BornoLand",
  description: "You do not have permission to view this section.",
};

export default function UnauthorizedPage() {
  return (
    <AuthShell variant="unauthorized">
      <div className="w-full text-center space-y-6 py-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your current account does not have permission to access the requested resource or store.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <Link
            href="/workshops"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
          >
            <Store className="h-4 w-4" />
            <span>Open Merchant Workspace</span>
          </Link>

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfe3e8] bg-white text-xs font-bold text-[#181c20] hover:bg-zinc-50 transition-colors"
          >
            <LogIn className="h-4 w-4 text-[#727785]" />
            <span>Sign in with another account</span>
          </Link>
        </div>

        <p className="text-[11px] text-[#727785]">
          If you believe this is an error, please contact your workspace owner or store administrator.
        </p>
      </div>
    </AuthShell>
  );
}
