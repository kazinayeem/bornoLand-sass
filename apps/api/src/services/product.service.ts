import { ProductModel } from "../models/product.model.js";

type ServiceResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

function buildPlaceholderImage(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f8fafc"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="64">${label}</text></svg>`
  )}`;
}

export async function createProduct(storeId: string, data: Record<string, unknown>) {
  const product = await ProductModel.create({
    storeId,
    ...data,
    image: data.image || buildPlaceholderImage(String(data.name ?? "Product")),
  });
  return { ok: true as const, data: { product: product.toObject() } };
}

export async function getProducts(storeId: string): Promise<ServiceResult<{ products: unknown[] }>> {
  const products = await ProductModel.find({ storeId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { products } };
}

export async function getProduct(id: string): Promise<ServiceResult<{ product: unknown }>> {
  const product = await ProductModel.findById(id).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { product } };
}

export async function getProductBySlug(storeId: string, slug: string): Promise<ServiceResult<{ product: unknown }>> {
  const product = await ProductModel.findOne({ storeId, slug }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { product } };
}

export async function updateProduct(id: string, storeId: string, payload: Record<string, unknown>): Promise<ServiceResult<{ product: unknown }>> {
  const product = await ProductModel.findOneAndUpdate({ _id: id, storeId }, { $set: payload }, { new: true }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { product } };
}

export async function deleteProduct(id: string, storeId: string): Promise<ServiceResult<undefined>> {
  const result = await ProductModel.deleteOne({ _id: id, storeId });
  if (!result.deletedCount) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: undefined, message: "Product deleted" };
}

export async function duplicateProduct(id: string, storeId: string): Promise<ServiceResult<{ product: unknown }>> {
  const product = await ProductModel.findOne({ _id: id, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };

  const duplicate = await ProductModel.create({
    ...product,
    _id: undefined,
    slug: `${String(product.slug)}-${Date.now()}`,
    name: `${String(product.name)} Copy`,
  });

  return { ok: true as const, data: { product: duplicate.toObject() } };
}
