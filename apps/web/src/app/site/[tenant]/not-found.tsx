import { StorefrontStatusPage, StorefrontButtonLink } from "@/components/storefront/storefront-ui";

export default function TenantNotFound() {
  return (
    <StorefrontStatusPage
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      action={<StorefrontButtonLink href="/">Go Home</StorefrontButtonLink>}
    />
  );
}
