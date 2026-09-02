"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Sparkles, CheckCircle2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useDuplicateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetBrandsQuery } from "@/redux/api/brand-api";

import { VariantsPanel } from "@/components/workspace/variants-panel";
import { ProductEditorActionBar } from "@/components/products/product-editor-action-bar";
import { ProductEditorSidebar } from "@/components/products/product-editor-sidebar";
import { ProductSectionNav, type ProductSectionId } from "@/components/products/product-section-nav";
import { ProductBasicSection } from "@/components/products/product-basic-section";
import { ProductPricingSection } from "@/components/products/product-pricing-section";
import { ProductInventorySection } from "@/components/products/product-inventory-section";
import { ProductOrganizationSection } from "@/components/products/product-organization-section";
import { ProductSeoSection } from "@/components/products/product-seo-section";
import { ProductEditorMediaTab } from "@/components/products/product-editor-media-tab";
import { ProductEditorShippingTab } from "@/components/products/product-editor-shipping-tab";
import { ProductEditorAdvancedTab } from "@/components/products/product-editor-advanced-tab";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EMPTY_PRODUCT_FORM,
  EMPTY_VARIANT_DRAFT,
  buildProductPayload,
  duplicateFormFromProduct,
  genSlug,
  productToForm,
  type ProductEditorForm,
  type VariantDraft,
} from "@/components/products/product-form";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { formatBDT } from "@/lib/format-bdt";

export type ProductEditorMode = "create" | "edit" | "duplicate";

type ProductEditorProps = {
  mode: ProductEditorMode;
  storeId: string;
  storeSlug: string;
  storeName: string;
  billingHref: string;
  productId?: string;
};

export function ProductEditor({
  mode,
  storeId,
  storeSlug,
  storeName,
  billingHref,
  productId,
}: ProductEditorProps) {
  const router = useRouter();
  const listHref = `/store/${storeSlug}/products`;

  const { data: productData, isLoading: loadingProduct } = useGetProductQuery(productId ?? "", {
    skip: !productId || mode === "create",
  });
  const { data: catsData } = useGetCategoriesQuery(storeId, { skip: !storeId });
  const categories = catsData?.data?.categories ?? [];
  const { data: brandsData } = useGetBrandsQuery(storeId, { skip: !storeId });
  const brands = brandsData?.data?.brands ?? [];

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const [activeSection, setActiveSection] = useState<ProductSectionId>("basic");
  const [form, setForm] = useState<ProductEditorForm>(EMPTY_PRODUCT_FORM);
  const [variantDraft, setVariantDraft] = useState<VariantDraft>(EMPTY_VARIANT_DRAFT);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const savedSnapshot = useRef<string>("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const product = productData?.data?.product;
  const isEdit = mode === "edit" && !!productId;
  const editorTitle =
    mode === "create" ? "Create product" : mode === "duplicate" ? "Duplicate product" : form.name || "Edit product";

  const snapshot = useMemo(
    () => JSON.stringify({ form, variantDraft }),
    [form, variantDraft]
  );

  const { confirmLeave } = useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (mode === "create" || initialized) return;
    if (!product) return;
    if (mode === "duplicate") {
      setForm(duplicateFormFromProduct(product));
      setVariantDraft({ options: product.options ?? [], variants: product.variants ?? [] });
    } else {
      setForm(productToForm(product));
      setVariantDraft({ options: product.options ?? [], variants: product.variants ?? [] });
    }
    savedSnapshot.current = JSON.stringify({
      form: mode === "duplicate" ? duplicateFormFromProduct(product) : productToForm(product),
      variantDraft: { options: product.options ?? [], variants: product.variants ?? [] },
    });
    setInitialized(true);
    setIsDirty(false);
  }, [product, mode, initialized]);

  useEffect(() => {
    if (!initialized && mode === "create") {
      savedSnapshot.current = JSON.stringify({ form: EMPTY_PRODUCT_FORM, variantDraft: EMPTY_VARIANT_DRAFT });
      setInitialized(true);
    }
  }, [mode, initialized]);

  useEffect(() => {
    if (!initialized) return;
    setIsDirty(snapshot !== savedSnapshot.current);
  }, [snapshot, initialized]);

  const patchForm = useCallback((patch: Partial<ProductEditorForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNameChange = useCallback(
    (name: string) => {
      setForm((prev) => ({
        ...prev,
        name,
        slug: isEdit ? prev.slug : genSlug(name),
      }));
    },
    [isEdit]
  );

  const scrollToSection = useCallback((id: ProductSectionId) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const save = useCallback(
    async (options?: { forceStatus?: ProductEditorForm["status"]; redirect?: boolean }) => {
      if (!form.name.trim()) {
        toast.error("Product name is required");
        scrollToSection("basic");
        const nameInput = document.querySelector('input[placeholder*="Ginger"]') as HTMLInputElement | null;
        nameInput?.focus();
        return false;
      }
      if (form.productType === "simple" && form.price === "") {
        toast.error("Selling price is required for simple products");
        scrollToSection("pricing");
        return false;
      }

      setSaving(true);
      setAutoSaveStatus("saving");
      try {
        const payload = buildProductPayload(form, variantDraft, {
          forceStatus: options?.forceStatus,
        });

        if (isEdit && productId) {
          await updateProduct({ storeId, id: productId, data: payload }).unwrap();
          if (options?.forceStatus === "active") {
            await revalidateStorefrontAction({
              tenantSlug: storeSlug,
              storeId,
              scope: "products",
              productSlug: payload.slug || form.slug,
            });
          }
          toast.success(options?.forceStatus === "active" ? "Product published" : "Product saved");
        } else {
          const result = await createProduct({ storeId, data: payload }).unwrap();
          const newId = result.data?.product?._id;
          if (options?.forceStatus === "active") {
            await revalidateStorefrontAction({
              tenantSlug: storeSlug,
              storeId,
              scope: "products",
              productSlug: payload.slug || form.slug,
            });
          }
          toast.success("Product created successfully");
          savedSnapshot.current = snapshot;
          setIsDirty(false);
          if (options?.redirect !== false && newId) {
            router.replace(`/store/${storeSlug}/products/${newId}/edit`);
            return true;
          }
        }

        savedSnapshot.current = snapshot;
        setIsDirty(false);
        setAutoSaveStatus("saved");
        return true;
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "data" in err
            ? String((err as { data?: { message?: string } }).data?.message ?? "Failed to save product")
            : "Failed to save product";
        toast.error(message);
        setAutoSaveStatus("error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [form, variantDraft, isEdit, productId, storeId, storeSlug, createProduct, updateProduct, router, snapshot, scrollToSection]
  );

  useEffect(() => {
    if (!isEdit || !isDirty || saving) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      void save({ redirect: false });
    }, 4000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isEdit, isDirty, saving, save]);

  const handleBack = () => {
    if (confirmLeave()) router.push(listHref);
  };

  const handlePublish = () => void save({ forceStatus: "active" });
  const handleSaveDraft = () => void save({ forceStatus: "draft", redirect: false });

  const handleDuplicate = async () => {
    if (!productId) return;
    try {
      const result = await duplicateProduct({ storeId, id: productId }).unwrap();
      const newId = result.data?.product?._id;
      toast.success("Product duplicated");
      if (newId) router.push(`/store/${storeSlug}/products/${newId}/edit`);
    } catch {
      toast.error("Failed to duplicate product");
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    try {
      await deleteProduct({ storeId, id: productId }).unwrap();
      toast.success("Product deleted");
      router.push(listHref);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  if ((mode === "edit" || mode === "duplicate") && loadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const sellPrice = Number(form.price) || 0;
  const costPrice = Number(form.costPrice) || 0;

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <ProductEditorActionBar
        title={editorTitle}
        backHref={listHref}
        saving={saving}
        autoSaveStatus={autoSaveStatus}
        isDirty={isDirty}
        productId={product?.slug}
        storeSlug={storeSlug}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDuplicate={isEdit ? handleDuplicate : undefined}
        onDelete={isEdit ? () => setShowDeleteConfirm(true) : undefined}
        onBack={handleBack}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_320px]">
        {/* Left: Sticky Section Navigator */}
        <div className="hidden lg:block">
          <ProductSectionNav
            form={form}
            variantDraft={variantDraft}
            activeSection={activeSection}
            onSelectSection={scrollToSection}
          />
        </div>

        {/* Center: Main Form Sections */}
        <div className="min-w-0 space-y-6">
          <ProductBasicSection
            form={form}
            isEdit={isEdit}
            onChange={patchForm}
            onNameChange={handleNameChange}
          />

          <div id="section-media" className="scroll-mt-24">
            <ProductEditorMediaTab
              form={form}
              storeId={storeId}
              billingHref={billingHref}
              onChange={patchForm}
            />
          </div>

          <ProductPricingSection form={form} onChange={patchForm} />

          <ProductInventorySection form={form} onChange={patchForm} />

          {form.productType === "variable" && (
            <section id="section-variants" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Product Variants
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Manage options (size, color, weight) and individual variant pricing and stock.
                </p>
              </div>
              <VariantsPanel
                options={variantDraft.options}
                variants={variantDraft.variants}
                onChange={setVariantDraft}
                storeId={storeId}
                billingHref={billingHref}
              />
            </section>
          )}

          <ProductOrganizationSection
            form={form}
            categories={categories}
            brands={brands}
            onChange={patchForm}
          />

          <div id="section-shipping" className="scroll-mt-24">
            <ProductEditorShippingTab form={form} onChange={patchForm} />
          </div>

          <ProductSeoSection form={form} storeSlug={storeSlug} onChange={patchForm} />

          <div id="section-advanced" className="scroll-mt-24">
            <ProductEditorAdvancedTab form={form} onChange={patchForm} />
          </div>
        </div>

        {/* Right Rail: Status & Live Preview Card */}
        <aside className="w-full space-y-4 lg:w-80">
          {/* Live Product Overview Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Product Summary
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                form.status === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : form.status === "draft"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}>
                {form.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt={form.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-zinc-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {form.name || "Untitled Product"}
                </p>
                <p className="text-xs text-zinc-400 font-mono truncate">
                  {form.sku || "No SKU"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
              <div>
                <p className="text-zinc-400">Selling Price</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {sellPrice > 0 ? formatBDT(sellPrice) : "—"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Cost Price</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {costPrice > 0 ? formatBDT(costPrice) : "—"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Total Stock</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {form.stock || "0"} units
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Type</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                  {form.productType}
                </p>
              </div>
            </div>
          </div>

          <ProductEditorSidebar
            form={form}
            product={product}
            storeName={storeName}
            categories={categories}
            brands={brands}
            onChange={patchForm}
            onDuplicate={isEdit ? handleDuplicate : undefined}
            onDelete={isEdit ? () => setShowDeleteConfirm(true) : undefined}
            previewHref={product?.slug ? `/products/${product.slug}` : undefined}
          />
        </aside>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
        title="Delete product"
        message={`Delete "${form.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
