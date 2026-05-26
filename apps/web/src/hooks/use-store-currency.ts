import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { formatCurrency } from "@/lib/format-currency";
import type { CurrencyCode } from "@/lib/format-currency";

export function useStoreCurrency() {
  const settings = useSelector((state: RootState) => state.storeSettings);

  const format = (amount: number) => formatCurrency(amount, {
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    currencyPosition: settings.currencyPosition,
    locale: settings.locale,
    decimalPlaces: settings.decimalPlaces,
  });

  return {
    currencyCode: settings.currencyCode as CurrencyCode,
    currencySymbol: settings.currencySymbol,
    format,
  };
}
