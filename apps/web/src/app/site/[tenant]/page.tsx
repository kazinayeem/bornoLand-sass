import { notFound } from "next/navigation";

type SitePageProps = {
  params: Promise<{
    tenant: string;
  }>;
};

async function fetchTenantSite(slug: string) {
  try {
    // Fetch from the Express API via the Next.js rewrite proxy
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function TenantSitePage({ params }: SitePageProps) {
  const { tenant: slug } = await params;

  // Resolve tenant data from the backend
  const data = await fetchTenantSite(slug);

  if (!data || !data.store) {
    notFound();
  }

  const { store, tenant, page } = data;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-24">
      <div
        className="rounded-[2rem] border p-10 shadow-sm"
        style={{
          borderColor: store.theme?.secondaryColor ?? "#e4e4e7",
          backgroundColor: store.theme?.darkMode ? "#0f172a" : "#ffffff",
          color: store.theme?.darkMode ? "#f8fafc" : "#0f172a",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              {tenant?.name ?? "Tenant"} &middot; Published Site
            </p>
            <h1 className="mt-4 text-4xl font-semibold">{store.name}</h1>
            {store.description && (
              <p className="mt-3 max-w-2xl opacity-70">{store.description}</p>
            )}
          </div>
          <div
            className="h-12 w-12 rounded-full"
            style={{ backgroundColor: store.theme?.primaryColor ?? "#2563eb" }}
          />
        </div>

        <div className="mt-10 grid gap-6 border-t pt-8" style={{ borderColor: store.theme?.secondaryColor ?? "#e4e4e7" }}>
          <div className="rounded-xl border bg-zinc-50 p-6 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Template</p>
            <p className="mt-1 text-lg font-semibold">{store.selectedTemplateId ? "Applied" : "None"}</p>
          </div>
          <div className="rounded-xl border bg-zinc-50 p-6 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Pages</p>
            <p className="mt-1 text-lg font-semibold">{page ? "Home page published" : "No published pages"}</p>
          </div>
          <div className="rounded-xl border bg-zinc-50 p-6 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Theme</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm">Primary:</span>
              <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: store.theme?.primaryColor ?? "#2563eb" }} />
              <span className="text-sm">Font:</span>
              <span className="text-sm font-medium">{store.theme?.font ?? "Inter"}</span>
            </div>
          </div>
        </div>
      </div>

      {page && (
        <div className="mt-8">
          <div
            className="prose prose-zinc mx-auto rounded-[2rem] border p-10 shadow-sm dark:prose-invert"
            style={{ borderColor: store.theme?.secondaryColor ?? "#e4e4e7" }}
          >
            <h2 style={{ color: store.theme?.primaryColor ?? "#2563eb" }}>{page.title}</h2>
            <p className="text-sm text-zinc-500">Status: {page.status} &middot; Sections: {page.sections?.length ?? 0}</p>
          </div>
        </div>
      )}
    </main>
  );
}
