"use client";

import { useGetMediaStatsQuery } from "@/redux/api/media-api";

export function useStorage(storeId?: string) {
  const query = useGetMediaStatsQuery(storeId ?? "", {
    skip: !storeId,
  });

  return {
    ...query,
    stats: query.data?.data?.stats ?? null,
  };
}
