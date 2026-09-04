import "server-only";

import { cookies } from "next/headers";

import { getApiUrl } from "@/lib/urls";

const API_BASE = getApiUrl();

type StorePayload = {
  success?: boolean;
  data?: {
    store?: {
      _id: string;
      slug: string;
    };
  };
};

type BuilderPagePayload = {
  success?: boolean;
  data?: {
    page?: {
      _id: string;
      slug: string;
    };
  };
};

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${API_BASE}${path}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getStoreSlugById(storeId: string): Promise<string | null> {
  const payload = await apiFetch<StorePayload>(`/stores/${storeId}`);
  return payload?.data?.store?.slug ?? null;
}

export async function getBuilderPageSlugById(pageId: string): Promise<string | null> {
  const payload = await apiFetch<BuilderPagePayload>(`/builder/page/${pageId}`);
  return payload?.data?.page?.slug ?? null;
}

export async function getUserDefaultStoreSlug(): Promise<string | null> {
  const payload = await apiFetch<{ success?: boolean; data?: { stores?: Array<{ slug?: string }> } }>("/stores/my-stores");
  const stores = payload?.data?.stores ?? [];
  return stores[0]?.slug ?? null;
}

export function isMongoObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}
