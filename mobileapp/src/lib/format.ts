export function formatMoney(value = 0, currency = "BDT") {
  try {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `৳${Math.round(value).toLocaleString()}`;
  }
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name = "Bornoland") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function sentence(value = "") {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
