"use client";

import { useEffect, useRef } from "react";
import { useMeQuery } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAccessToken } from "@/lib/access-token";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";

export function SessionInit() {
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useMeQuery();
  const initialized = useRef(false);

  // On first mount, check URL hash for access token (e.g., Google OAuth redirect)
  useEffect(() => {
    if (typeof window !== "undefined" && !initialized.current) {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const token = params.get("access_token");
        if (token) {
          setAccessToken(token);
          // Clean the hash from URL without triggering a reload
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    }
  }, []);

  // Restore Redux state from /auth/me response
  useEffect(() => {
    if (isSuccess && data?.data?.session && !initialized.current) {
      initialized.current = true;
      const session = data.data.session;

      // If the me endpoint returned a new access token, store it
      if (data.data.accessToken) {
        setAccessToken(data.data.accessToken);
      }

      dispatch(
        setAuthState({
          session,
          user: {
            id: session.userId,
            name: session.name,
            email: session.email,
            role: session.role,
            tenantId: session.tenantId,
          },
        })
      );
      dispatch(
        setUserProfile({
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          tenantId: session.tenantId,
        })
      );
      dispatch(setTenantContext({ tenantId: session.tenantId }));
    }
  }, [isSuccess, data, dispatch]);

  return null;
}
