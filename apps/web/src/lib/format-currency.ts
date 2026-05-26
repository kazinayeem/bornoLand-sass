export type CurrencyCode = "USD" | "BDT" | "EUR" | "INR";

export type CurrencyFormatSettings = {
  currencyCode?: CurrencyCode;
  currencySymbol?: string;
  currencyPosition?: "before" | "after";
  decimalPlaces?: number;
  locale?: string;
};

const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; position: "before" | "after"; locale: string; decimalPlaces: number }> = {
  USD: { symbol: "$", position: "before", locale: "en-US", decimalPlaces: 2 },
  BDT: { symbol: "\u09f3", position: "before", locale: "bn-BD", decimalPlaces: 0 },
  EUR: { symbol: "\u20ac", position: "before", locale: "de-DE", decimalPlaces: 2 },
  INR: { symbol: "\u20b9", position: "before", locale: "en-IN", decimalPlaces: 2 },
};

export function formatCurrency(amount: number, settings?: CurrencyFormatSettings | CurrencyCode | null) {
  let currencyCode: CurrencyCode | undefined;
  let overrides: Record<string, any> | undefined;

  if (typeof settings === "string") {
    currencyCode = settings as CurrencyCode;
  } else if (settings) {
    currencyCode = settings.currencyCode;
    overrides = settings as Record<string, any>;
  }

  if (currencyCode && CURRENCY_MAP[currencyCode]) {
    const map = CURRENCY_MAP[currencyCode];
    const currencySymbol = overrides?.currencySymbol ?? map.symbol;
    const currencyPosition: "before" | "after" = overrides?.currencyPosition ?? map.position;
    const locale = overrides?.locale ?? map.locale;
    const decimalPlaces = overrides?.decimalPlaces ?? map.decimalPlaces;

    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(amount);

    return currencyPosition === "after" ? `${formatted} ${currencySymbol}` : `${currencySymbol}${formatted}`;
  }

  const s = overrides ?? {};
  const currencySymbol = s.currencySymbol ?? "$";
  const currencyPosition = s.currencyPosition ?? "before";
  const locale = s.locale ?? "en-US";
  const decimalPlaces = s.decimalPlaces ?? 2;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);

  return currencyPosition === "after" ? `${formatted} ${currencySymbol}` : `${currencySymbol}${formatted}`;
}
