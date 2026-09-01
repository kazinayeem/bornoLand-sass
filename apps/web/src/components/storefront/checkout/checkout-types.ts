import type { PublicPaymentMethod, PublicDeliveryZone } from "@/lib/server/checkout-data";

export type CheckoutFormState = {
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  email: string;
  country: string;
  countryCode: string;
  divisionId: string;
  divisionName: string;
  divisionNameBn?: string;
  districtId: string;
  districtName: string;
  districtNameBn?: string;
  upazilaId: string;
  upazilaName: string;
  upazilaNameBn?: string;
  unionId?: string;
  unionName?: string;
  village?: string;
  state: string;
  city: string;
  area: string;
  street: string;
  apartment: string;
  zip: string;
  landmark: string;
  notes: string;
};

export const EMPTY_FORM: CheckoutFormState = {
  label: "Home",
  fullName: "",
  phone: "",
  email: "",
  country: "Bangladesh",
  countryCode: "BD",
  divisionId: "",
  divisionName: "",
  divisionNameBn: "",
  districtId: "",
  districtName: "",
  districtNameBn: "",
  upazilaId: "",
  upazilaName: "",
  upazilaNameBn: "",
  unionId: "",
  unionName: "",
  village: "",
  state: "",
  city: "",
  area: "",
  street: "",
  apartment: "",
  zip: "",
  landmark: "",
  notes: "",
};

export type CheckoutStoreData = {
  _id?: string;
  name?: string;
  shortName?: string;
  slug?: string;
  logoUrl?: string;
  currency?: string;
  currencyCode?: string;
};

export type CheckoutSettingsData = {
  currencyCode?: string;
  currencySymbol?: string;
  taxRate?: number;
  requireLoginEnabled?: boolean;
  cashOnDelivery?: boolean;
  paymentSettings?: {
    codEnabled?: boolean;
    bkash?: { enabled?: boolean; number?: string };
    nagad?: { enabled?: boolean; number?: string };
  };
  deliveryZones?: Array<{
    id?: string;
    _id?: string;
    name: string;
    charge: number;
    estimatedDays?: string;
  }>;
};

export type CheckoutInitialProps = {
  initialPaymentMethods: PublicPaymentMethod[];
  initialDeliveryZones: PublicDeliveryZone[];
  store: CheckoutStoreData | null;
  settings: CheckoutSettingsData | null;
  theme?: unknown;
  tenantSlug: string;
};
