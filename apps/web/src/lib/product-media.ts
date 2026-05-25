export type ProductMediaLike = {
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images?: string[];
};

export function getProductImageUrl(product: ProductMediaLike) {
  return product.imageUrl ?? product.thumbnailUrl ?? product.galleryImageUrls?.[0] ?? product.images?.[0] ?? "";
}