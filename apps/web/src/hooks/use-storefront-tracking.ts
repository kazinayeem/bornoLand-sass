"use client";

import { useCallback } from "react";
import { trackingManager } from "@/lib/tracking/tracking-manager";
import type { TrackingItem, TrackingPayload, TrackingUserData } from "@/lib/tracking/types";

export function useStorefrontTracking() {
  const trackPageView = useCallback((payload: TrackingPayload = {}) => {
    trackingManager.track("PageView", payload);
  }, []);

  const trackViewContent = useCallback(
    (product: {
      id: string;
      name?: string;
      price?: number;
      category?: string;
      currency?: string;
    }) => {
      const price = typeof product.price === "number" ? product.price : 0;
      trackingManager.track("ViewContent", {
        content_name: product.name || "",
        content_category: product.category || "",
        content_ids: [product.id],
        content_type: "product",
        value: price,
        currency: product.currency || "BDT",
        contents: [
          {
            id: product.id,
            name: product.name,
            price,
            category: product.category,
            quantity: 1,
          },
        ],
      });
    },
    []
  );

  const trackSearch = useCallback((searchString: string) => {
    const trimmed = (searchString || "").trim();
    if (!trimmed) return;
    trackingManager.track("Search", {
      search_string: trimmed,
    });
  }, []);

  const trackAddToCart = useCallback(
    (item: {
      id: string;
      name?: string;
      price?: number;
      quantity?: number;
      category?: string;
      currency?: string;
    }) => {
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const price = typeof item.price === "number" ? item.price : 0;
      const value = price * quantity;

      trackingManager.track("AddToCart", {
        content_name: item.name || "",
        content_category: item.category || "",
        content_ids: [item.id],
        content_type: "product",
        value,
        currency: item.currency || "BDT",
        num_items: quantity,
        contents: [
          {
            id: item.id,
            name: item.name,
            price,
            category: item.category,
            quantity,
          },
        ],
      });
    },
    []
  );

  const trackInitiateCheckout = useCallback(
    (data: {
      items?: TrackingItem[];
      totalValue?: number;
      numItems?: number;
      currency?: string;
    }) => {
      const items = data.items || [];
      const numItems = data.numItems ?? items.reduce((sum, it) => sum + (it.quantity || 1), 0);

      trackingManager.track("InitiateCheckout", {
        contents: items,
        content_ids: items.map((i) => i.id),
        content_type: "product",
        value: data.totalValue ?? 0,
        currency: data.currency || "BDT",
        num_items: numItems,
      });
    },
    []
  );

  const trackAddPaymentInfo = useCallback(
    (data: {
      paymentMethod?: string;
      totalValue?: number;
      currency?: string;
      items?: TrackingItem[];
    }) => {
      trackingManager.track("AddPaymentInfo", {
        value: data.totalValue ?? 0,
        currency: data.currency || "BDT",
        payment_type: data.paymentMethod,
        contents: data.items,
        content_ids: data.items?.map((i) => i.id),
      });
    },
    []
  );

  const trackPurchase = useCallback(
    (order: {
      orderId: string;
      items?: TrackingItem[];
      totalValue: number;
      currency?: string;
      userData?: TrackingUserData;
    }) => {
      const items = order.items || [];
      const numItems = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

      trackingManager.track(
        "Purchase",
        {
          order_id: order.orderId,
          content_ids: items.map((i) => i.id),
          content_type: "product",
          contents: items,
          value: order.totalValue,
          currency: order.currency || "BDT",
          num_items: numItems,
          user_data: order.userData,
        },
        `purchase_${order.orderId}`
      );
    },
    []
  );

  const trackLead = useCallback((data: { formName?: string; email?: string; phone?: string }) => {
    trackingManager.track("Lead", {
      content_name: data.formName || "Contact Form",
      email: data.email,
      phone: data.phone,
    });
  }, []);

  const trackCompleteRegistration = useCallback((data?: { method?: string }) => {
    trackingManager.track("CompleteRegistration", {
      status: "completed",
      registration_method: data?.method || "standard",
    });
  }, []);

  const trackCustom = useCallback((eventName: string, payload: TrackingPayload = {}) => {
    trackingManager.track("Custom", {
      ...payload,
      custom_event_name: eventName,
    });
  }, []);

  const setUserData = useCallback((userData: TrackingUserData) => {
    trackingManager.setUserData(userData);
  }, []);

  return {
    trackPageView,
    trackViewContent,
    trackSearch,
    trackAddToCart,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackLead,
    trackCompleteRegistration,
    trackCustom,
    setUserData,
  };
}
