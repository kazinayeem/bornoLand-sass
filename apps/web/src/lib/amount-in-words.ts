const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const CURRENCY_WORDS: Record<string, string> = {
  BDT: "Taka",
  USD: "Dollars",
  EUR: "Euros",
  GBP: "Pounds",
  INR: "Rupees",
  AED: "Dirhams",
  SAR: "Riyals",
  CAD: "Dollars",
  AUD: "Dollars",
};

function twoDigits(n: number): string {
  if (n < 20) return ONES[n] || "";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

export function amountInWords(n: number, currencyCode = "BDT"): string {
  const whole = Math.floor(Math.abs(Number.isFinite(n) ? n : 0));
  const currency =
    CURRENCY_WORDS[(currencyCode || "").toUpperCase()] ||
    (currencyCode?.trim() ? currencyCode.trim().toUpperCase() : "Only");

  if (whole === 0) {
    return currencyCode ? `Zero ${currency} Only` : "Zero Only";
  }

  const crore = Math.floor(whole / 1_00_00_000);
  const lakh = Math.floor((whole % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((whole % 1_00_00_000) / 1000);
  const hundred = whole % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  if (currencyCode) return `${words} ${currency} Only`;
  return `${words} Only`;
}
