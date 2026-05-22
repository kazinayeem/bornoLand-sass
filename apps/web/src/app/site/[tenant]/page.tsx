type SitePageProps = {
  params: Promise<{
    tenant: string;
  }>;
};

export default async function TenantSitePage({ params }: SitePageProps) {
  const { tenant } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-24">
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Published tenant site</p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-950">{tenant}</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          This route is the public surface served after subdomain or custom-domain resolution.
        </p>
      </div>
    </main>
  );
}