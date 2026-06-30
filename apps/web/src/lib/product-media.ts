import { resolveMediaUrl } from "@/lib/resolve-media-url";

export type ProductMediaLike = {
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images?: string[];
};

export function getProductImageUrl(product: ProductMediaLike) {
  return resolveMediaUrl(
    product.imageUrl ?? product.thumbnailUrl ?? product.galleryImageUrls?.[0] ?? product.images?.[0] ?? ""
  );
}

export function getProductGalleryUrls(product: ProductMediaLike) {
  return [product.imageUrl, product.thumbnailUrl, ...(product.galleryImageUrls ?? []), ...(product.images ?? [])]
    .filter((value): value is string => Boolean(value))
    .map((value) => resolveMediaUrl(value))
    .filter((value, index, array) => value && array.indexOf(value) === index);
}