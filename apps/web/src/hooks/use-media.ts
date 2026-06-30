"use client";

import { useGetMediaFilesQuery, type MediaFile } from "@/redux/api/media-api";

type UseMediaParams = {
  storeId?: string;
  folder?: string;
  search?: string;
  fileType?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export function useMedia(params: UseMediaParams) {
  const { storeId, ...queryParams } = params;
  const query = useGetMediaFilesQuery(
    { storeId: storeId ?? "", ...queryParams },
    { skip: !storeId }
  );

  return {
    ...query,
    files: (query.data?.data?.files ?? []) as MediaFile[],
    stats: query.data?.data?.stats ?? null,
    globalStats: query.data?.data?.globalStats ?? null,
    total: query.data?.data?.total ?? 0,
  };
}
