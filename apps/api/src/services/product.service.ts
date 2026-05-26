import { ProductModel } from "../models/product.model.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1200x1200/png";

export async function createProduct(data: Record<string, unknown>) {
  const product = await ProductModel.create({
    ...data,
    image: data.image || `${PLACEHOLDER_IMAGE_URL}?text=${encodeURIComponent(String(data.name ?? "Product"))}`,
  });
  return product;
}
