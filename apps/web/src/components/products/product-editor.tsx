"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useDuplicateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { VariantsPanel } from "@/components/workspace/variants-panel";
import { ProductEditorActionBar } from "@/components/products/product-editor-action-bar";
import { ProductEditorSidebar } from "@/components/products/product-editor-sidebar";
import { ProductEditorGeneralTab } from "@/components/products/product-editor-general-tab";
import { ProductEditorMediaTab } from "@/components/products/product-editor-media-tab";
import { ProductEditorInventoryTab } from "@/components/products/product-editor-inventory-tab";
import { ProductEditorShippingTab } from "@/components/products/product-editor-shipping-tab";
import { ProductEditorSeoTab } from "@/components/products/product-editor-seo-tab";
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
  type ProductEditorTab,
  type VariantDraft,
} from "@/components/products/product-form";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";

const TABS: { id: ProductEditorTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "media", label: "Media" },
  { id: "variants", label: "Variants" },
  { id: "inventory", label: "Inventory" },
  { id: "shipping", label: "Shipping" },
  { id: "seo", label: "SEO" },
  { id: "advanced", label: "Advanced" },
];

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
  const { data: catsData } = useGetCategoriesQuery(storeId);
  const categories = catsData?.data?.categories ?? [];

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const [activeTab, setActiveTab] = useState<ProductEditorTab>("general");
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

  const save = useCallback(
    async (options?: { forceStatus?: ProductEditorForm["status"]; redirect?: boolean }) => {
      if (!form.name.trim()) {
        toast.error("Product name is required");
        return false;
      }
      if (form.productType === "simple" && form.price === "") {
        toast.error("Price is required for simple products");
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
          toast.success(options?.forceStatus === "active" ? "Product published" : "Product saved");
        } else {
          const result = await createProduct({ storeId, data: payload }).unwrap();
          const newId = result.data?.product?._id;
          toast.success("Product created");
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
    [form, variantDraft, isEdit, productId, storeId, storeSlug, createProduct, updateProduct, router, snapshot]
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

  const visibleTabs = TABS.filter((tab) => tab.id !== "variants" || form.productType === "variable");

  if ((mode === "edit" || mode === "duplicate") && loadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
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

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {(isEdit || mode === "duplicate") && (
            <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {form.name || (mode === "duplicate" ? "Duplicate Product" : "Product")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{storeName}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                  Status: {form.status}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                  SKU: {form.sku || "—"}
                </span>
              </div>
            </section>
          )}

          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "general" && (
            <ProductEditorGeneralTab
              form={form}
              categories={categories}
              isEdit={isEdit}
              onChange={patchForm}
              onNameChange={handleNameChange}
            />
          )}
          {activeTab === "media" && (
            <ProductEditorMediaTab form={form} storeId={storeId} billingHref={billingHref} onChange={patchForm} />
          )}
          {activeTab === "variants" && form.productType === "variable" && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <VariantsPanel
                options={variantDraft.options}
                variants={variantDraft.variants}
                onChange={setVariantDraft}
                storeId={storeId}
                billingHref={billingHref}
              />
            </section>
          )}
          {activeTab === "inventory" && <ProductEditorInventoryTab form={form} onChange={patchForm} />}
          {activeTab === "shipping" && <ProductEditorShippingTab form={form} onChange={patchForm} />}
          {activeTab === "seo" && <ProductEditorSeoTab form={form} onChange={patchForm} />}
          {activeTab === "advanced" && <ProductEditorAdvancedTab form={form} onChange={patchForm} />}
        </div>

        <aside className="w-full shrink-0 lg:w-80">
          <ProductEditorSidebar
            form={form}
            product={product}
            storeName={storeName}
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
