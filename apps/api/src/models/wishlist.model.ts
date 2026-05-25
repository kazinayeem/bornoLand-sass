import mongoose, { Schema } from "mongoose";

const wishlistItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" }
}, { _id: false });

const wishlistSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  sessionId: { type: String },
  items: [wishlistItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

wishlistSchema.index({ storeId: 1, customerId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ storeId: 1, sessionId: 1 }, { unique: true, sparse: true });

export const WishlistModel = mongoose.model("Wishlist", wishlistSchema);
