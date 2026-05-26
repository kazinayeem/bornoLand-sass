export type WorkspaceTabId =
  | "overview" | "products" | "categories" | "orders"
  | "theme" | "builder" | "cms" | "customers"
  | "payments" | "delivery" | "checkout" | "analytics" | "settings";

export const workspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "payments", label: "Payments" },
  { id: "delivery", label: "Delivery" },
  { id: "checkout", label: "Checkout" },
  { id: "analytics", label: "Analytics" },
  { id: "cms", label: "CMS" },
  { id: "theme", label: "Theme" },
  { id: "builder", label: "Builder" },
  { id: "settings", label: "Settings" },
];
