export type ProductMediaLike = {
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images?: string[];
};

export function getProductImageUrl(product: ProductMediaLike) {
  return product.imageUrl ?? product.thumbnailUrl ?? product.galleryImageUrls?.[0] ?? product.images?.[0] ?? "";
}

export function getProductGalleryUrls(product: ProductMediaLike) {
  return [product.imageUrl, product.thumbnailUrl, ...(product.galleryImageUrls ?? []), ...(product.images ?? [])]
    .filter((value): value is string => Boolean(value))
    .filter((value, index, array) => array.indexOf(value) === index);
}