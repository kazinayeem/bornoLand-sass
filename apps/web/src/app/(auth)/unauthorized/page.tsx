export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">Access denied</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          You do not have permission to open this page. Contact a workspace owner or super admin if this looks wrong.
        </p>
      </div>
    </main>
  );
}
