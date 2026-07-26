import type { CourierProviderSlug } from "./courier.constants.js";
import { isCourierProviderSlug } from "./courier.constants.js";
import type { ICourierProvider } from "./courier.types.js";
import { PathaoProvider } from "./providers/pathao.provider.js";
import { RedXProvider } from "./providers/redx.provider.js";
import { SteadfastProvider } from "./providers/steadfast.provider.js";
import { PaperflyProvider } from "./providers/paperfly.provider.js";
import { SundarbanProvider } from "./providers/sundarban.provider.js";

type ProviderCtor = new () => ICourierProvider;

/**
 * Factory — register new couriers here only.
 * Business/services always resolve providers through getCourierProvider().
 */
const REGISTRY: Record<CourierProviderSlug, ProviderCtor> = {
  pathao: PathaoProvider,
  redx: RedXProvider,
  steadfast: SteadfastProvider,
  paperfly: PaperflyProvider,
  sundarban: SundarbanProvider,
};

const instances = new Map<CourierProviderSlug, ICourierProvider>();

export function getCourierProvider(slug: string): ICourierProvider {
  if (!isCourierProviderSlug(slug)) {
    throw new Error(`Unknown courier provider: ${slug}`);
  }
  let instance = instances.get(slug);
  if (!instance) {
    instance = new REGISTRY[slug]();
    instances.set(slug, instance);
  }
  return instance;
}

export function listRegisteredCourierProviders(): ICourierProvider[] {
  return (Object.keys(REGISTRY) as CourierProviderSlug[]).map((slug) => getCourierProvider(slug));
}
