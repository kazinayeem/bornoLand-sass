"use client";

import { useEffect, useRef } from "react";
import { useMeQuery } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAccessToken } from "@/lib/access-token";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { clearRedirectAfterLogin } from "@/lib/auth-redirect-client";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { subscribeToAuthEvents } from "@/lib/auth-tab-sync";
import {
  refreshAccessTokenCoordinated,
  subscribeToTokenRefresh,
} from "@/lib/auth-refresh-coordinator";

const ACCESS_TOKEN_REFRESH_MS = 12 * 60 * 1000;

export function SessionInit() {
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useMeQuery();
  const initialized = useRef(false);
  const refreshInFlight = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    if (!token) return;

    setAccessToken(token);
    clearRedirectAfterLogin();
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    if (isSuccess && data?.data?.session && !initialized.current) {
      initialized.current = true;
      const session = data.data.session;

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

  useEffect(() => {
    return subscribeToTokenRefresh((token) => {
      setAccessToken(token);
    });
  }, []);

  useEffect(() => {
    if (!isSuccess || !data?.data?.session) return;

    const renew = async () => {
      if (document.visibilityState !== "visible" || refreshInFlight.current) return;
      refreshInFlight.current = true;
      try {
        await refreshAccessTokenCoordinated();
      } finally {
        refreshInFlight.current = false;
      }
    };

    const timer = window.setInterval(() => {
      void renew();
    }, ACCESS_TOKEN_REFRESH_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void renew();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isSuccess, data?.data?.session]);

  useEffect(
    () =>
      subscribeToAuthEvents((type) => {
        if (type !== "logout" && type !== "expired") return;
        setAccessToken(null);
        dispatch(clearAuthState());
        window.dispatchEvent(new Event("app:auth-expired"));
      }),
    [dispatch]
  );

  return null;
}
