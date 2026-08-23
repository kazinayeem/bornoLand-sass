import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

// ─── Page Type Enum ───────────────────────────────────────────────────────────

export const PAGE_TYPES = [
  "home", "shop", "product", "category", "collection",
  "cart", "checkout", "wishlist", "account", "login", "register",
  "forgot_password", "order_tracking", "search", "contact",
  "about", "faq", "privacy_policy", "terms_conditions", "shipping_policy",
  "returns_policy", "blog", "blog_details", "system_404",
  "custom", "landing",
] as const;

export type PageType = (typeof PAGE_TYPES)[number];

export const SYSTEM_PAGE_TYPES: PageType[] = [
  "home", "shop", "product", "category", "collection",
  "cart", "checkout", "wishlist", "account", "login", "register",
  "forgot_password", "order_tracking", "search", "contact",
  "blog", "blog_details", "system_404",
];

// ─── Page SEO sub-schema ─────────────────────────────────────────────────────

const pageSeoSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    ogType: { type: String, default: "website" },
    twitterCard: { type: String, default: "summary_large_image" },
    noIndex: { type: Boolean, default: false },
    canonicalUrl: { type: String, default: "" },
  },
  { _id: false }
);

// ─── Page Settings sub-schema ────────────────────────────────────────────────

const pageSettingsSchema = new Schema(
  {
    customCss: { type: String, default: "" },
    customJs: { type: String, default: "" },
    password: { type: String, default: "" },
    passwordProtect: { type: Boolean, default: false },
    redirectUrl: { type: String, default: "" },
    redirectType: { type: String, enum: ["301", "302", "none"], default: "none" },
    showHeader: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    transparentHeader: { type: Boolean, default: false },
    stickyHeader: { type: Boolean, default: false },
    layoutWidth: { type: String, default: "1200px" },
    layoutStyle: { type: String, enum: ["default", "full-width", "sidebar", "landing"], default: "default" },
  },
  { _id: false }
);

// ─── Page Theme Override sub-schema ──────────────────────────────────────────

const pageThemeSchema = new Schema(
  {
    primaryColor: { type: String, default: "" },
    secondaryColor: { type: String, default: "" },
    font: { type: String, default: "" },
    buttonStyle: { type: String, default: "" },
    darkMode: { type: Boolean, default: false },
    navbarStyle: { type: String, default: "" },
  },
  { _id: false }
);

// ─── Header Settings sub-schema ──────────────────────────────────────────────

const headerSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    visible: { type: Boolean, default: true },
    template: { type: String, default: "modern-ecommerce" },
    templateId: { type: String },
    headerTemplate: { type: String },
    position: { type: String, default: "sticky" },
    scrollingBehavior: { type: String, default: "always" },
    autoHideOnScroll: { type: Boolean, default: false },
    shadow: { type: String, default: "none" },
    transparent: { type: Boolean, default: false },
    logo: { type: String, default: "" },
    logoWidth: { type: Number, default: 140 },
    sticky: { type: Boolean, default: false },
    height: { type: String, default: "auto" },
    background: { type: String, default: "" },
    borderColor: { type: String, default: "" },
    padding: { type: String, default: "16px 24px" },
    showSearch: { type: Boolean, default: true },
    showWishlist: { type: Boolean, default: true },
    showCart: { type: Boolean, default: true },
    showProfile: { type: Boolean, default: true },
    showLanguageSwitcher: { type: Boolean, default: false },
    showCurrencySwitcher: { type: Boolean, default: false },
    announcementBar: { type: String, default: "" },
    announcementText: { type: String, default: "" },
    showAnnouncement: { type: Boolean, default: true },
    topBar: { type: String, default: "" },
    desktopLayout: { type: String, default: "default" },
    mobileLayout: { type: String, default: "hamburger" },
    maxVisibleCategories: { type: Number, default: 6 },
    showMoreMenu: { type: Boolean, default: true },
    enableCategoryHover: { type: Boolean, default: true },
    categorySource: { type: String, default: "store-categories" },
  },
  { _id: false, strict: false }
);

// ─── Footer Settings sub-schema ──────────────────────────────────────────────

const footerSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    visible: { type: Boolean, default: true },
    template: { type: String, default: "classic-ecommerce" },
    templateId: { type: String },
    footerTemplate: { type: String },
    layout: { type: String, default: "classic-ecommerce" },
    mobileLayout: { type: String, default: "accordion" },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    showNewsletter: { type: Boolean, default: false },
    showSocial: { type: Boolean, default: true },
    showPaymentIcons: { type: Boolean, default: true },
    showCopyright: { type: Boolean, default: true },
    copyright: { type: String, default: "" },
    columns: { type: Number, default: 4 },
    background: { type: String, default: "" },
    textColor: { type: String, default: "" },
    padding: { type: String, default: "48px 24px 24px" },
  },
  { _id: false, strict: false }
);

// ─── Store Page Schema ───────────────────────────────────────────────────────

const storePageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    pageIcon: { type: String, default: "file-text" },
    featuredImage: { type: String, default: "" },

    // Page type — identifies the purpose of this page
    pageType: {
      type: String,
      enum: PAGE_TYPES,
      default: "custom",
      index: true,
    },
    isSystem: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["visible", "hidden", "password"],
      default: "visible",
    },

    isHomePage: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    // Main page sections
    sections: [{ type: Schema.Types.Mixed }],

    // Independent header & footer sections
    headerSections: [{ type: Schema.Types.Mixed }],
    footerSections: [{ type: Schema.Types.Mixed }],

    // References to global (reusable) sections
    globalSectionIds: [{ type: Schema.Types.ObjectId, ref: "GlobalSection" }],

    html: { type: String, default: "" },

    theme: { type: pageThemeSchema, default: () => ({}) },
    seo: { type: pageSeoSchema, default: () => ({}) },
    settings: { type: pageSettingsSchema, default: () => ({}) },
    headerSettings: { type: headerSettingsSchema, default: () => ({}) },
    footerSettings: { type: footerSettingsSchema, default: () => ({}) },

    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    archivedAt: { type: Date },
    restoredFrom: { type: Schema.Types.ObjectId, ref: "PageVersion" },

    // Soft delete fields
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Preview token
    previewToken: { type: String, default: null, index: true },
    previewTokenExpiresAt: { type: Date, default: null },

    parentId: { type: Schema.Types.ObjectId, ref: "StorePage", default: null },
    isFolder: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storePageSchema.index({ storeId: 1, slug: 1 }, { unique: true });
storePageSchema.index({ storeId: 1, pageType: 1 });
storePageSchema.index({ storeId: 1, status: 1 });
storePageSchema.index({ storeId: 1, sortOrder: 1 });
storePageSchema.index({ storeId: 1, parentId: 1 });
storePageSchema.index({ storeId: 1, deletedAt: 1 });

export type StorePageDocument = InferSchemaType<typeof storePageSchema>;
export const StorePageModel = models.StorePage ?? model("StorePage", storePageSchema);
