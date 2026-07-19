"use client";

import { useEffect, useRef } from "react";
import { useMeQuery, useRefreshMutation } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAccessToken } from "@/lib/access-token";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { clearRedirectAfterLogin } from "@/lib/auth-redirect-client";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { subscribeToAuthEvents } from "@/lib/auth-tab-sync";

export function SessionInit() {
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useMeQuery();
  const [refresh] = useRefreshMutation();
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
          clearRedirectAfterLogin();
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

  // Access tokens are intentionally short lived. Refresh proactively while the
  // app is open and whenever a dormant tab becomes active, rather than waiting
  // for a failed request to interrupt the user.
  useEffect(() => {
    if (!isSuccess || !data?.data?.session) return;
    const renew = () => {
      if (document.visibilityState === "visible") void refresh().unwrap().catch(() => undefined);
    };
    const timer = window.setInterval(renew, 12 * 60 * 1000);
    const onVisibility = () => { if (document.visibilityState === "visible") renew(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, [isSuccess, data?.data?.session, refresh]);

  useEffect(() => subscribeToAuthEvents(() => {
    setAccessToken(null);
    dispatch(clearAuthState());
    // Protected routes listen for this event and redirect with the current
    // location preserved. It also synchronizes a user-initiated logout across
    // tabs without placing session data in localStorage.
    window.dispatchEvent(new Event("app:auth-expired"));
  }), [dispatch]);

  return null;
}
