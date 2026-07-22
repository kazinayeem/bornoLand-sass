import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: Array<{ label: string; href: string }>;
};

export function AdminPlaceholderPage({ title, description, icon: Icon, actions }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} />
      <div className="rounded-2xl border border-apple-hairline bg-apple-canvas p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-apple-canvas-parchment">
          <Icon className="h-7 w-7 text-apple-primary" />
        </div>
        <h2 className="text-lg font-semibold text-apple-ink">{title}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-apple-ink-muted-48">{description}</p>
        {actions && actions.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center rounded-lg bg-apple-primary px-4 py-2 text-sm font-medium text-apple-on-primary transition hover:bg-apple-primary-focus"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
