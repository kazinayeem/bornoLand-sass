export type CurrencyFormatSettings = {
  currencySymbol?: string;
  currencyPosition?: "before" | "after";
  decimalPlaces?: number;
  locale?: string;
};

export function formatCurrency(amount: number, settings?: CurrencyFormatSettings) {
  const decimalPlaces = settings?.decimalPlaces ?? 2;
  const locale = settings?.locale ?? "en-US";
  const currencySymbol = settings?.currencySymbol ?? "$";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(amount);

  return settings?.currencyPosition === "after" ? `${formatted} ${currencySymbol}` : `${currencySymbol}${formatted}`;
}