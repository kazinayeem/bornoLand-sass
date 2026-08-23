import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const menuItemSchema = new Schema(
  {
    navigationId: { type: Schema.Types.ObjectId, ref: "Navigation", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },

    parentId: { type: Schema.Types.ObjectId, ref: "MenuItem", default: null, index: true },

    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: "", trim: true },
    titleBn: { type: String, default: "", trim: true },
    link: { type: String, default: "" },
    icon: { type: String, default: "" },
    badge: { type: String, default: "" },
    badgeColor: { type: String, default: "" },

    linkType: {
      type: String,
      enum: [
        "custom",
        "page",
        "collection",
        "category",
        "subcategory",
        "brand",
        "mega_menu",
        "dropdown",
        "product",
        "blog",
        "external",
      ],
      default: "custom",
    },
    referenceId: { type: String, default: "" },

    target: { type: String, enum: ["_self", "_blank"], default: "_self" },
    isExternal: { type: Boolean, default: false },
    openInNewTab: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    authRequired: { type: Boolean, default: false },

    isVisible: { type: Boolean, default: true },
    hideOnDesktop: { type: Boolean, default: false },
    hideOnMobile: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    level: { type: Number, default: 0 },

    cssClass: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

menuItemSchema.index({ navigationId: 1, sortOrder: 1 });
menuItemSchema.index({ navigationId: 1, parentId: 1, sortOrder: 1 });

export type MenuItemDocument = InferSchemaType<typeof menuItemSchema>;
export const MenuItemModel = models.MenuItem ?? model("MenuItem", menuItemSchema);
