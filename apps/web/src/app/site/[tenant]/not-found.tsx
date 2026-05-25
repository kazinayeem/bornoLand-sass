import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl font-bold text-zinc-200">404</div>
      <h1 className="text-2xl font-bold text-zinc-900">Page not found</h1>
      <p className="max-w-md text-sm text-zinc-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
        Go Home
      </Link>
    </div>
  );
}
