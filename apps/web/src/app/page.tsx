import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_28%),linear-gradient(180deg,_#fafafa_0%,_#eef2ff_100%)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">BornoLand</p>
          <p className="text-xs text-zinc-500">By Bornosoft</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-zinc-500 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
              AI-powered multi-tenant SaaS
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-zinc-950 md:text-7xl">
                Build tenant-aware landing pages with AI speed.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
                BornoLand gives Bornosoft a Shopify-style multi-tenant landing page platform with subdomains, Auth.js,
                MongoDB Atlas, billing, analytics, and a scalable builder.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white/90 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
              <p className="text-sm font-medium text-zinc-500">What you get</p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                <li>• Multi-tenant workspaces with tenantId isolation</li>
                <li>• Google and email/password authentication</li>
                <li>• Landing page builder and publish flow</li>
                <li>• Admin dashboard, billing, analytics, and templates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}