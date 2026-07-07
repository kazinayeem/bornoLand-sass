const BDT_SYMBOL = "৳";

export function formatBDT(amount: number): string {
  if (amount == null || isNaN(amount)) return `${BDT_SYMBOL} 0`;
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-IN");
  return `${BDT_SYMBOL} ${formatted}`;
}

export function formatBDTShort(amount: number): string {
  if (amount == null || isNaN(amount)) return `${BDT_SYMBOL} 0`;
  const abs = Math.abs(amount);
  let value: string;
  if (abs >= 10000000) {
    value = `${(amount / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    value = `${(amount / 100000).toFixed(2)} Lac`;
  } else if (abs >= 1000) {
    value = `${(amount / 1000).toFixed(1)}k`;
  } else {
    value = String(Math.round(amount));
  }
  return `${BDT_SYMBOL} ${value}`;
}

export function formatBDTCompact(amount: number): string {
  return formatBDTShort(amount);
}

export function parseBDTResponse(data: {
  currency?: string;
  amount?: number;
  formattedAmount?: string;
}): string {
  if (data?.formattedAmount) return data.formattedAmount;
  if (data?.amount != null) return formatBDT(data.amount);
  return `${BDT_SYMBOL} 0`;
}

export type BDTValue = {
  currency: "BDT";
  amount: number;
  formattedAmount: string;
  symbol: "৳";
};

export function bdtValue(amount: number): BDTValue {
  return {
    currency: "BDT",
    amount,
    formattedAmount: formatBDT(amount),
    symbol: "৳",
  };
}
