export default function AdminDashboardPage() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Users</div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Tenants</div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Subscriptions</div>
    </section>
  );
}