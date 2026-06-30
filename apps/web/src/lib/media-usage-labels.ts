const ENTITY_LABELS: Record<string, string> = {
  product: "Products",
  product_variant: "Variants",
  category: "Categories",
  collection: "Collections",
  cms_page: "CMS Pages",
  homepage_slider: "Homepage Banner",
  store: "Store Logo",
  campaign: "Campaigns",
  page_builder: "Pages",
  payment_method: "Payment Methods",
};

export function entityTypeLabel(entityType: string) {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export function formatUsageSummary(byEntityType: Record<string, number>) {
  const parts = Object.entries(byEntityType).map(([type, count]) => `${count} ${entityTypeLabel(type)}`);
  return parts.join(", ");
}
