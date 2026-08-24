"use client";

import { useCallback } from "react";
import { trackingManager } from "@/lib/tracking/tracking-manager";
import type { TrackingItem, TrackingPayload } from "@/lib/tracking/types";

export function useStorefrontTracking() {
  const trackPageView = useCallback(() => {
    trackingManager.track("PageView", {});
  }, []);

  const trackViewContent = useCallback(
    (product: {
      id: string;
      name?: string;
      price?: number;
      category?: string;
      currency?: string;
    }) => {
      trackingManager.track("ViewContent", {
        content_name: product.name,
        content_category: product.category,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: product.currency || "BDT",
        contents: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            quantity: 1,
          },
        ],
      });
    },
    []
  );

  const trackSearch = useCallback((searchString: string) => {
    if (!searchString.trim()) return;
    trackingManager.track("Search", {
      search_string: searchString.trim(),
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
      const quantity = item.quantity || 1;
      const value = item.price ? item.price * quantity : undefined;

      trackingManager.track("AddToCart", {
        content_name: item.name,
        content_category: item.category,
        content_ids: [item.id],
        content_type: "product",
        value,
        currency: item.currency || "BDT",
        contents: [
          {
            id: item.id,
            name: item.name,
            price: item.price,
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
      trackingManager.track("InitiateCheckout", {
        contents: data.items,
        content_ids: data.items?.map((i) => i.id),
        value: data.totalValue,
        currency: data.currency || "BDT",
        num_items: data.numItems || data.items?.length,
      });
    },
    []
  );

  const trackAddPaymentInfo = useCallback(
    (data: {
      paymentMethod?: string;
      totalValue?: number;
      currency?: string;
    }) => {
      trackingManager.track("AddPaymentInfo", {
        value: data.totalValue,
        currency: data.currency || "BDT",
        payment_type: data.paymentMethod,
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
    }) => {
      trackingManager.track(
        "Purchase",
        {
          order_id: order.orderId,
          content_ids: order.items?.map((i) => i.id),
          contents: order.items,
          value: order.totalValue,
          currency: order.currency || "BDT",
          num_items: order.items?.length,
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
  };
}
