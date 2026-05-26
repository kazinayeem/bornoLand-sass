import { connectDatabase } from "../config/database.js";
import { CmsPageModel } from "../models/cms-page.model.js";
import { FaqModel } from "../models/faq.model.js";
import { StoreModel } from "../models/store.model.js";

const defaultPages = [
  { slug: "faq", title: "FAQ" },
  { slug: "shipping-info", title: "Shipping Info" },
  { slug: "returns", title: "Returns Policy" },
  { slug: "size-guide", title: "Size Guide" },
  { slug: "contact-us", title: "Contact Us" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-conditions", title: "Terms & Conditions" },
  { slug: "about-us", title: "About Us" },
];

function defaultHtml(slug: string): string {
  const templates: Record<string, string> = {
    faq: "<h2>Frequently Asked Questions</h2><p>Find answers to common questions about our products and services.</p>",
    "shipping-info": "<h2>Shipping Information</h2><p>Learn about our shipping options, delivery times, and costs.</p>",
    returns: "<h2>Returns & Exchanges</h2><p>Our return policy ensures you're completely satisfied with your purchase.</p>",
    "size-guide": "<h2>Size Guide</h2><p>Find the perfect fit with our detailed size measurements.</p>",
    "contact-us": "<h2>Contact Us</h2><p>Get in touch with our team. We're here to help.</p>",
    "privacy-policy": "<h2>Privacy Policy</h2><p>How we collect, use, and protect your personal information.</p>",
    "terms-conditions": "<h2>Terms & Conditions</h2><p>Please read these terms carefully before using our store.</p>",
    "about-us": "<h2>About Us</h2><p>Learn more about our story, mission, and values.</p>",
  };
  return templates[slug] ?? "<h2>Page</h2><p>Content coming soon.</p>";
}

export async function getCmsPages(storeId: string) {
  await connectDatabase();
  const pages = await CmsPageModel.find({ storeId }).sort({ createdAt: 1 }).lean();
  return { ok: true as const, data: { pages } };
}

export async function getCmsPage(storeId: string, slug: string) {
  await connectDatabase();
  let page = await CmsPageModel.findOne({ storeId, slug }).lean() as any;
  if (!page) {
    const def = defaultPages.find((p) => p.slug === slug);
    if (!def) return { ok: false as const, message: "Page not found" };
    page = await CmsPageModel.create({ storeId, slug: def.slug, title: def.title, html: defaultHtml(slug) });
    page = page.toObject();
  }
  return { ok: true as const, data: { page } };
}

export async function saveCmsPage(storeId: string, userId: string, slug: string, payload: {
  title?: string; html?: string; seoTitle?: string; seoDescription?: string;
  ogImage?: string; published?: boolean; layout?: string;
}) {
  await connectDatabase();

  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  } else {
    const store = await StoreModel.findById(storeId).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }

  const update: Record<string, unknown> = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.html !== undefined) update.html = payload.html;
  if (payload.seoTitle !== undefined) update.seoTitle = payload.seoTitle;
  if (payload.seoDescription !== undefined) update.seoDescription = payload.seoDescription;
  if (payload.ogImage !== undefined) update.ogImage = payload.ogImage;
  if (payload.published !== undefined) update.published = payload.published;
  if (payload.layout !== undefined) update.layout = payload.layout;

  const page = await CmsPageModel.findOneAndUpdate(
    { storeId, slug },
    { $set: update, $setOnInsert: { storeId, slug, title: payload.title ?? slug, html: payload.html ?? "" } },
    { upsert: true, new: true }
  ).lean();

  return { ok: true as const, data: { page } };
}

export async function getFaqs(storeId: string) {
  await connectDatabase();
  const faqs = await FaqModel.find({ storeId }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return { ok: true as const, data: { faqs } };
}

export async function createFaq(storeId: string, userId: string, payload: { question: string; answer: string; category?: string }) {
  await connectDatabase();

  const store = userId
    ? await StoreModel.findOne({ _id: storeId, userId }).lean()
    : await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const count = await FaqModel.countDocuments({ storeId });
  const faq = await FaqModel.create({ storeId, ...payload, sortOrder: count });

  return { ok: true as const, data: { faq: faq.toObject() } };
}

export async function updateFaq(faqId: string, storeId: string, userId: string, payload: Partial<{ question: string; answer: string; sortOrder: number; active: boolean; category: string }>) {
  await connectDatabase();

  const store = userId
    ? await StoreModel.findOne({ _id: storeId, userId }).lean()
    : await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const faq = await FaqModel.findOneAndUpdate(
    { _id: faqId, storeId },
    { $set: payload },
    { new: true }
  ).lean();

  if (!faq) return { ok: false as const, message: "FAQ not found" };
  return { ok: true as const, data: { faq } };
}

export async function deleteFaq(faqId: string, storeId: string, userId: string) {
  await connectDatabase();

  const store = userId
    ? await StoreModel.findOne({ _id: storeId, userId }).lean()
    : await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const faq = await FaqModel.findOneAndDelete({ _id: faqId, storeId }).lean();
  if (!faq) return { ok: false as const, message: "FAQ not found" };
  return { ok: true as const, message: "FAQ deleted" };
}

export async function reorderFaqs(storeId: string, userId: string, orderedIds: string[]) {
  await connectDatabase();

  const store = userId
    ? await StoreModel.findOne({ _id: storeId, userId }).lean()
    : await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  for (let i = 0; i < orderedIds.length; i++) {
    await FaqModel.updateOne({ _id: orderedIds[i], storeId }, { $set: { sortOrder: i } });
  }
  return { ok: true as const, message: "FAQs reordered" };
}
