import { permanentRedirect } from "next/navigation";

export default async function StorefrontProductsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      sp.set(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string") sp.append(key, v);
      }
    }
  }

  const queryString = sp.toString();
  permanentRedirect(queryString ? `/shop?${queryString}` : "/shop");
}
