import { apiRequest } from "../../lib/api";
import type { BuilderPage, BuilderSection } from "./builder-types";

type ApiResponse<T> = { success: boolean; data?: T; message?: string };

export async function getHomePage(storeId: string): Promise<BuilderPage> {
  const result = await apiRequest<ApiResponse<{ page: BuilderPage }>>(`/builder/${storeId}/home`);
  if (!result.data?.page) throw new Error("Could not load builder page");
  return result.data.page;
}

export async function savePage(pageId: string, payload: {
  sections: BuilderSection[];
  headerSections?: BuilderSection[];
  footerSections?: BuilderSection[];
}): Promise<void> {
  await apiRequest<ApiResponse<never>>(`/builder/page/${pageId}/save`, {
    method: "PUT",
    body: payload,
  });
}

export async function getPage(pageId: string): Promise<BuilderPage> {
  const result = await apiRequest<ApiResponse<{ page: BuilderPage }>>(`/store-pages/${pageId}`);
  if (!result.data?.page) throw new Error("Could not load page");
  return result.data.page;
}

export async function getPages(storeId: string): Promise<BuilderPage[]> {
  const result = await apiRequest<ApiResponse<{ pages: BuilderPage[] }>>(`/store-pages/stores/${storeId}`);
  return result.data?.pages ?? [];
}

export async function publishPage(pageId: string): Promise<void> {
  await apiRequest<ApiResponse<never>>(`/store-pages/${pageId}/publish`, { method: "POST" });
}

export async function duplicatePage(pageId: string): Promise<BuilderPage> {
  const result = await apiRequest<ApiResponse<{ page: BuilderPage }>>(`/store-pages/${pageId}/duplicate`, { method: "POST" });
  if (!result.data?.page) throw new Error("Could not duplicate page");
  return result.data.page;
}

export async function createPage(storeId: string, page: { title: string; slug: string; pageType: string }): Promise<BuilderPage> {
  const result = await apiRequest<ApiResponse<{ page: BuilderPage }>>(`/store-pages/stores/${storeId}`, {
    method: "POST",
    body: page,
  });
  if (!result.data?.page) throw new Error("Could not create page");
  return result.data.page;
}
