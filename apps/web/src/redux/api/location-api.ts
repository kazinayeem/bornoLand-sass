import { baseApi } from "./base-api";

export type LocationDivision = {
  id: string;
  name: string;
  nameBn: string;
};

export type LocationDistrict = {
  id: string;
  divisionId: string;
  name: string;
  nameBn: string;
  defaultPostalCode?: string;
};

export type LocationUpazila = {
  id: string;
  districtId: string;
  divisionId: string;
  name: string;
  nameBn: string;
  postalCodes?: string[];
  unions?: Array<{ id: string; name: string; nameBn: string }>;
};

export type ZoneMatchResult = {
  matched: boolean;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  charge: number;
  estimatedDays?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDivisions: builder.query<ApiResponse<{ divisions: LocationDivision[] }>, void>({
      query: () => ({
        url: "/locations/divisions",
        method: "GET",
      }),
    }),
    getDistricts: builder.query<ApiResponse<{ districts: LocationDistrict[] }>, string | undefined>({
      query: (divisionId) => ({
        url: divisionId ? `/locations/divisions/${divisionId}/districts` : "/locations/districts",
        method: "GET",
      }),
    }),
    getUpazilas: builder.query<ApiResponse<{ upazilas: LocationUpazila[] }>, string | undefined>({
      query: (districtId) => ({
        url: districtId ? `/locations/districts/${districtId}/upazilas` : "/locations/upazilas",
        method: "GET",
      }),
    }),
    matchDeliveryZone: builder.query<
      ApiResponse<ZoneMatchResult>,
      { storeId: string; divisionId?: string; districtId?: string; upazilaId?: string }
    >({
      query: ({ storeId, divisionId, districtId, upazilaId }) => ({
        url: "/locations/match-zone",
        method: "GET",
        params: { storeId, divisionId, districtId, upazilaId },
      }),
    }),
  }),
});

export const {
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useLazyMatchDeliveryZoneQuery,
} = locationApi;
