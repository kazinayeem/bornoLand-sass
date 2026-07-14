import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

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

    sections: [{ type: Schema.Types.Mixed }],
    html: { type: String, default: "" },

    theme: { type: pageThemeSchema, default: () => ({}) },
    seo: { type: pageSeoSchema, default: () => ({}) },
    settings: { type: pageSettingsSchema, default: () => ({}) },

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
storePageSchema.index({ storeId: 1, status: 1 });
storePageSchema.index({ storeId: 1, sortOrder: 1 });
storePageSchema.index({ storeId: 1, parentId: 1 });
storePageSchema.index({ storeId: 1, deletedAt: 1 });

export type StorePageDocument = InferSchemaType<typeof storePageSchema>;
export const StorePageModel = models.StorePage ?? model("StorePage", storePageSchema);
