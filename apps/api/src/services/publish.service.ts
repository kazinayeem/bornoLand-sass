import { PageModel } from "../models/page.model.js";

export async function publishPage(pageId: string, tenantId: string, userId: string) {
  const page = await PageModel.findOne({ _id: pageId, tenantId });

  if (!page) {
    throw new Error("Page not found");
  }

  page.publishedData = page.draftData;
  page.publishStatus = "published";
  page.publishedAt = new Date();
  page.publishedBy = userId as never;

  await page.save();

  return page;
}