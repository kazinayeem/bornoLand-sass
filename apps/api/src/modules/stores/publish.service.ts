import { StorePageModel } from "../pages/store-page.model.js";

export async function publishPage(pageId: string, tenantId: string, userId: string) {
  const page = await StorePageModel.findOne({ _id: pageId, tenantId, deletedAt: null });

  if (!page) {
    throw new Error("Page not found");
  }

  page.status = "published";
  page.publishedAt = new Date();

  await page.save();

  return page;
}