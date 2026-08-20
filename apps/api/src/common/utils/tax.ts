export type TaxSettingsInput = {
  taxEnabled?: boolean;
  taxRate?: number;
  taxIncluded?: boolean;
};

export type TaxCalculationResult = {
  tax: number;
  taxRate: number;
  taxIncluded: boolean;
};

export function calculateTax(taxableAmount: number, settings: TaxSettingsInput = {}): TaxCalculationResult {
  if (!settings.taxEnabled || !settings.taxRate || settings.taxRate <= 0) {
    return { tax: 0, taxRate: 0, taxIncluded: false };
  }

  const rate = Number(settings.taxRate) || 0;
  const isIncluded = Boolean(settings.taxIncluded);

  if (isIncluded) {
    const tax = Math.round((taxableAmount - taxableAmount / (1 + rate / 100)) * 100) / 100;
    return { tax: Math.max(0, tax), taxRate: rate, taxIncluded: true };
  }

  const tax = Math.round(taxableAmount * (rate / 100) * 100) / 100;
  return { tax: Math.max(0, tax), taxRate: rate, taxIncluded: false };
}
