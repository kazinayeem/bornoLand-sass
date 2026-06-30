"use client";

import { useGetStoreSubscriptionPaymentsQuery } from "@/redux/api/subscription-payment-api";

export function useSubscription(storeId?: string) {
  const query = useGetStoreSubscriptionPaymentsQuery(storeId ?? "", {
    skip: !storeId,
  });

  return {
    ...query,
    payments: query.data?.data?.payments ?? [],
  };
}
