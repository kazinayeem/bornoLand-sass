import { StorefrontButtonLink } from "@/components/storefront/storefront-ui";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-hero-display text-apple-divider-soft">404</div>
      <h1 className="text-display-md text-apple-ink">Page not found</h1>
      <p className="max-w-md text-body text-apple-ink-muted-48">
        The page you are looking for does not exist or has been moved.
      </p>
      <StorefrontButtonLink href="/">Go Home</StorefrontButtonLink>
    </div>
  );
}
