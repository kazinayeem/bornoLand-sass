import { connectDatabase } from "../../common/database/connection.js";
import { MediaFileModel } from "./media-file.model.js";
import { MediaReferenceModel } from "./media-reference.model.js";
import { CategoryModel } from "../categories/category.model.js";
import { ProductModel } from "../products/product.model.js";
import { VariantImageModel } from "../products/variants/variant-image.model.js";

export type MediaRefInput = {
  fieldPath: string;
  mediaFileId?: string | null;
  label?: string;
};

export type MediaUsageSummary = {
  total: number;
  byEntityType: Record<string, number>;
  references: Array<{
    entityType: string;
    entityId: string;
    fieldPath: string;
    label: string;
  }>;
};

type ResolvedMediaFile = {
  _id: unknown;
  publicUrl: string;
  thumbnailUrl?: string;
};

const ENTITY_LABELS: Record<string, string> = {
  product: "Products",
  product_variant: "Variants",
  category: "Categories",
  collection: "Collections",
  cms_page: "CMS Pages",
  homepage_slider: "Banners",
  store: "Store Settings",
  campaign: "Campaigns",
  page_builder: "Pages",
  payment_method: "Payment Methods",
};

export function entityTypeLabel(entityType: string) {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export async function resolveMediaFile(storeId: string, mediaFileId?: string | null) {
  if (!mediaFileId) return null;
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: mediaFileId, storeId, isDeleted: false }).lean();
  return file as ResolvedMediaFile | null;
}

export async function resolveMediaFiles(storeId: string, mediaFileIds: Array<string | null | undefined>) {
  await connectDatabase();
  const ids = mediaFileIds.filter(Boolean) as string[];
  if (ids.length === 0) return new Map<string, { publicUrl: string; thumbnailUrl?: string }>();
  const files = await MediaFileModel.find({ _id: { $in: ids }, storeId, isDeleted: false }).lean() as unknown as ResolvedMediaFile[];
  return new Map(
    files.map((file) => [
      String(file._id),
      { publicUrl: file.publicUrl, thumbnailUrl: file.thumbnailUrl ?? file.publicUrl },
    ])
  );
}

export async function syncEntityMediaReferences(
  storeId: string,
  entityType: string,
  entityId: string,
  refs: MediaRefInput[]
) {
  await connectDatabase();
  await MediaReferenceModel.deleteMany({ storeId, entityType, entityId });

  const rows = refs
    .filter((ref) => ref.mediaFileId)
    .map((ref) => ({
      storeId,
      mediaFileId: ref.mediaFileId,
      entityType,
      entityId,
      fieldPath: ref.fieldPath,
      label: ref.label ?? "",
    }));

  if (rows.length > 0) {
    await MediaReferenceModel.insertMany(rows);
  }
}

export async function removeEntityMediaReferences(storeId: string, entityType: string, entityId: string) {
  await connectDatabase();
  await MediaReferenceModel.deleteMany({ storeId, entityType, entityId });
}

export async function getMediaUsage(storeId: string, mediaFileId: string): Promise<MediaUsageSummary> {
  await connectDatabase();
  const references = await MediaReferenceModel.find({ storeId, mediaFileId }).lean();
  const byEntityType: Record<string, number> = {};
  for (const ref of references) {
    byEntityType[ref.entityType] = (byEntityType[ref.entityType] ?? 0) + 1;
  }
  return {
    total: references.length,
    byEntityType,
    references: references.map((ref) => ({
      entityType: ref.entityType,
      entityId: String(ref.entityId),
      fieldPath: ref.fieldPath,
      label: ref.label ?? "",
    })),
  };
}

export async function getReferenceCounts(storeId: string, mediaFileIds: string[]) {
  await connectDatabase();
  if (mediaFileIds.length === 0) return new Map<string, number>();
  const grouped = await MediaReferenceModel.aggregate<{ _id: unknown; count: number }>([
    { $match: { storeId, mediaFileId: { $in: mediaFileIds } } },
    { $group: { _id: "$mediaFileId", count: { $sum: 1 } } },
  ]);
  return new Map(grouped.map((row) => [String(row._id), row.count]));
}

export async function replaceMediaReferences(storeId: string, oldMediaFileId: string, newMediaFileId: string) {
  await connectDatabase();
  const newFile = await MediaFileModel.findOne({ _id: newMediaFileId, storeId, isDeleted: false }).lean() as ResolvedMediaFile | null;
  if (!newFile) return { ok: false as const, message: "Replacement media file not found" };

  const result = await MediaReferenceModel.updateMany(
    { storeId, mediaFileId: oldMediaFileId },
    { $set: { mediaFileId: newMediaFileId } }
  );

  await propagateMediaReplacement(storeId, oldMediaFileId, newMediaFileId, {
    publicUrl: newFile.publicUrl,
    thumbnailUrl: newFile.thumbnailUrl ?? newFile.publicUrl,
  });

  return {
    ok: true as const,
    data: {
      updated: result.modifiedCount ?? 0,
      newPublicUrl: newFile.publicUrl,
      newThumbnailUrl: newFile.thumbnailUrl ?? newFile.publicUrl,
    },
  };
}

export async function propagateMediaReplacement(
  storeId: string,
  oldMediaFileId: string,
  newMediaFileId: string,
  urls: { publicUrl: string; thumbnailUrl: string }
) {
  await connectDatabase();

  await CategoryModel.updateMany(
    { storeId, imageId: oldMediaFileId },
    { $set: { imageId: newMediaFileId, imageUrl: urls.publicUrl } }
  );
  await CategoryModel.updateMany(
    { storeId, bannerId: oldMediaFileId },
    { $set: { bannerId: newMediaFileId, bannerUrl: urls.publicUrl } }
  );
  await CategoryModel.updateMany(
    { storeId, iconId: oldMediaFileId },
    { $set: { iconId: newMediaFileId, iconUrl: urls.publicUrl } }
  );

  await ProductModel.updateMany(
    { storeId, featuredImageId: oldMediaFileId },
    { $set: { featuredImageId: newMediaFileId, imageUrl: urls.publicUrl, thumbnailUrl: urls.thumbnailUrl } }
  );

  const productsWithGallery = await ProductModel.find({
    storeId,
    galleryImageIds: oldMediaFileId,
  }).lean();

  for (const product of productsWithGallery) {
    const galleryIds = ((product.galleryImageIds ?? []) as unknown[]).map((id: unknown) =>
      String(id) === oldMediaFileId ? newMediaFileId : String(id)
    );
    const galleryUrls = ((product.galleryImageUrls ?? []) as string[]).map((url: string, index: number) => {
      const id = (product.galleryImageIds ?? [])[index];
      return id && String(id) === oldMediaFileId ? urls.publicUrl : url;
    });
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { galleryImageIds: galleryIds, galleryImageUrls: galleryUrls } }
    );
  }

  await VariantImageModel.updateMany(
    { storeId, mediaId: oldMediaFileId },
    { $set: { mediaId: newMediaFileId, url: urls.publicUrl, thumbnailUrl: urls.thumbnailUrl } }
  );
}
