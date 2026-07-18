import { connectDatabase } from "../../common/database/connection.js";
import { PageModel } from "../../models/page.model.js";
import { StorePageModel } from "./store-page.model.js";

/**
 * One-time migration: copies pages from the legacy `Page` collection
 * (PageModel) into the `StorePage` collection (StorePageModel).
 *
 * Idempotent — skips pages that already exist (matched by storeId + slug).
 * Safe to run multiple times.
 */
export async function migratePagesToStorePages(): Promise<{
  created: number;
  skipped: number;
  errors: number;
}> {
  await connectDatabase();

  const legacyPages = await PageModel.find({}).lean();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const legacyPage of legacyPages) {
    try {
      // Normalize slug: PageModel uses "home", StorePageModel uses "/"
      const slug = normalizeSlug(legacyPage.slug, legacyPage.isHome);

      // Check if a StorePage already exists for this store + slug
      const existing = await StorePageModel.findOne({
        storeId: legacyPage.storeId,
        slug,
      }).lean();

      if (existing) {
        skipped++;
        continue;
      }

      // Map legacy fields to StorePageModel fields
      await StorePageModel.create({
        storeId: legacyPage.storeId,
        title: legacyPage.title,
        slug,
        description: "",
        pageType: legacyPage.isHome ? "home" : (legacyPage.pageType || "custom"),
        isSystem: legacyPage.isHome,
        status: legacyPage.status || "draft",
        visibility: "visible",
        isHomePage: !!legacyPage.isHome,
        sortOrder: 0,
        sections: legacyPage.sections || [],
        headerSections: legacyPage.headerSections || [],
        footerSections: legacyPage.footerSections || [],
        headerSettings: legacyPage.headerSettings || {},
        footerSettings: legacyPage.footerSettings || {},
        theme: legacyPage.theme || {},
        seo: legacyPage.seo || {},
        settings: {
          showHeader: legacyPage.showHeader ?? true,
          showFooter: legacyPage.showFooter ?? true,
          customCss: legacyPage.customCss || "",
          customJs: legacyPage.customJs || "",
          password: legacyPage.password || "",
        },
        featuredImage: legacyPage.featuredImage || "",
      });

      created++;
    } catch (err) {
      console.error(`[migrate] Failed to migrate page ${legacyPage._id}:`, err);
      errors++;
    }
  }

  const summary = `Migration complete: ${created} created, ${skipped} skipped, ${errors} errors (of ${legacyPages.length} total)`;
  console.log(`[migrate] ${summary}`);

  return { created, skipped, errors };
}

function normalizeSlug(slug: string, isHome: boolean): string {
  if (isHome) return "/";
  if (slug === "home") return "/";
  return slug.startsWith("/") ? slug : `/${slug}`;
}
