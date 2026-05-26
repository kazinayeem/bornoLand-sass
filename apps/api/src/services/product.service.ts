import { ProductModel } from "../models/product.model.js";

function buildPlaceholderImage(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f8fafc"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="64">${label}</text></svg>`
  )}`;
}

export async function createProduct(data: Record<string, unknown>) {
  const product = await ProductModel.create({
    ...data,
    image: data.image || buildPlaceholderImage(String(data.name ?? "Product")),
  });
  return product;
}
