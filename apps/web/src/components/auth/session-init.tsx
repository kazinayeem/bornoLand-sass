"use client";

import { useEffect, useRef } from "react";
import { useMeQuery } from "@/redux/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { getAccessToken, setAccessToken } from "@/lib/access-token";
import { setAuthState, clearAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile, clearUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { clearRedirectAfterLogin } from "@/lib/auth-redirect-client";
import { subscribeToAuthEvents } from "@/lib/auth-tab-sync";
import {
  refreshAccessTokenCoordinated,
  subscribeToTokenRefresh,
} from "@/lib/auth-refresh-coordinator";
import { authLog, maskToken } from "@/lib/auth-debug";

const ACCESS_TOKEN_REFRESH_MS = 12 * 60 * 1000;

export function SessionInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data, isSuccess, isError, isFetching } = useMeQuery();
  const initialized = useRef(false);
  const refreshInFlight = useRef(false);
  const hadSession = useRef(false);

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
    if (!isSuccess || !data || isFetching) return;

    const session = data.data?.session;
    if (!session) {
      // Initial anonymous /auth/me is normal. Only clear UI after we previously
      // had a real session (or an in-memory access token from login).
      if (hadSession.current || isAuthenticated || getAccessToken()) {
        authLog("warn", "logout trigger: /auth/me returned no session", {
          hadSession: hadSession.current,
          isAuthenticated,
          accessToken: maskToken(getAccessToken()),
        });
        setAccessToken(null);
        dispatch(clearAuthState());
        dispatch(clearUserProfile());
        initialized.current = false;
        hadSession.current = false;
      }
      return;
    }

    hadSession.current = true;

    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      authLog("info", "current user fetch restored session", {
        accessToken: maskToken(data.data.accessToken),
        userId: session.userId,
        email: session.email,
      });
    }

    if (initialized.current) return;
    initialized.current = true;

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
      }),
    );
    dispatch(
      setUserProfile({
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        tenantId: session.tenantId,
      }),
    );
    dispatch(setTenantContext({ tenantId: session.tenantId }));
  }, [isSuccess, isFetching, data, dispatch, isAuthenticated]);

  useEffect(() => {
    // /auth/me returns 200 with session:null for anonymous users — isError is rare.
    if (!isError) return;
    if (!hadSession.current && !isAuthenticated && !getAccessToken()) return;

    authLog("warn", "logout trigger: /auth/me request failed", {
      hadSession: hadSession.current,
      isAuthenticated,
    });
    setAccessToken(null);
    dispatch(clearAuthState());
    dispatch(clearUserProfile());
    initialized.current = false;
    hadSession.current = false;
  }, [isError, dispatch, isAuthenticated]);

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
        authLog("debug", "proactive refresh request");
        const token = await refreshAccessTokenCoordinated();
        if (!token) {
          // Do not hard-logout on a single proactive failure — the next API
          // call will refresh again and clear only if that also fails.
          authLog("warn", "proactive refresh failed — keeping session until request-path refresh fails");
        }
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
        authLog("warn", "logout trigger: cross-tab auth event", { type });
        setAccessToken(null);
        dispatch(clearAuthState());
        dispatch(clearUserProfile());
        initialized.current = false;
        hadSession.current = false;
        window.dispatchEvent(new Event("app:auth-expired"));
      }),
    [dispatch],
  );

  return null;
}
