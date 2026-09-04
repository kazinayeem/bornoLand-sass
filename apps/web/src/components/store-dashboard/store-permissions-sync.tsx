"use client";

import { useEffect } from "react";
import { useGetMyStorePermissionsQuery } from "@/redux/api/team-api";
import { useAppDispatch } from "@/store/hooks";
import { setStorePermissions } from "@/redux/slices/auth-slice";

export function StorePermissionsSync({ storeId }: { storeId: string }) {
  const dispatch = useAppDispatch();
  const { data: res } = useGetMyStorePermissionsQuery(storeId, {
    skip: !storeId,
  });

  useEffect(() => {
    if (res?.data) {
      dispatch(
        setStorePermissions({
          permissions: res.data.permissions || [],
          isOwner: Boolean(res.data.isOwner),
          role: res.data.role || "viewer",
        })
      );
    }
  }, [res, dispatch]);

  return null;
}
