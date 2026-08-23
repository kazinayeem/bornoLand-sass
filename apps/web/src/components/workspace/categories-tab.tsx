"use client";

import { useState, useMemo } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "@/redux/api/category-api";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  type Brand,
} from "@/redux/api/brand-api";
import {
  Layers,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Search,
  FolderTree,
  Award,
  AlertTriangle,
  ExternalLink,
  Package,
  Globe,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/media/media-picker";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";

type TabMode = "categories" | "subcategories" | "brands";

type CategoriesTabProps = {
  storeId: string;
  billingHref?: string;
};

export function CategoriesTab({ storeId, billingHref = "#" }: CategoriesTabProps) {
  const { store } = useStorePage();
  const [activeTab, setActiveTab] = useState<TabMode>("categories");

  // RTK Queries & Mutations
  const { data: catData, isLoading: loadingCats, refetch: refetchCats } = useGetCategoriesQuery(storeId);
  const { data: brandData, isLoading: loadingBrands, refetch: refetchBrands } = useGetBrandsQuery(storeId);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const allCategories = useMemo(() => catData?.data?.categories ?? [], [catData]);
  const allBrands = useMemo(() => brandData?.data?.brands ?? [], [brandData]);

  // Derived lists
  const rootCategories = useMemo(
    () => allCategories.filter((c) => !c.parentId),
    [allCategories]
  );
  const subcategories = useMemo(
    () => allCategories.filter((c) => Boolean(c.parentId)),
    [allCategories]
  );

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    isSubcategory: boolean;
    category: Category | null;
  }>({ open: false, isSubcategory: false, category: null });

  const [brandModal, setBrandModal] = useState<{
    open: boolean;
    brand: Brand | null;
  }>({ open: false, brand: null });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "category" | "subcategory" | "brand";
    id: string;
    name: string;
    productCount: number;
    subCount?: number;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  // Filtered views
  const filteredRootCategories = useMemo(() => {
    return rootCategories.filter((c) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (statusFilter === "active" && !c.active) return false;
      if (statusFilter === "inactive" && c.active) return false;
      return true;
    });
  }, [rootCategories, searchTerm, statusFilter]);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((c) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (parentFilter !== "all" && c.parentId !== parentFilter) return false;
      if (statusFilter === "active" && !c.active) return false;
      if (statusFilter === "inactive" && c.active) return false;
      return true;
    });
  }, [subcategories, searchTerm, parentFilter, statusFilter]);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((b) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = b.name.toLowerCase().includes(term) || b.slug.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (statusFilter === "active" && !b.active) return false;
      if (statusFilter === "inactive" && b.active) return false;
      return true;
    });
  }, [allBrands, searchTerm, statusFilter]);

  // Form handlers
  const handleOpenAddCategory = (isSub = false) => {
    setCategoryModal({ open: true, isSubcategory: isSub, category: null });
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryModal({ open: true, isSubcategory: Boolean(cat.parentId), category: cat });
  };

  const handleOpenAddBrand = () => {
    setBrandModal({ open: true, brand: null });
  };

  const handleOpenEditBrand = (brand: Brand) => {
    setBrandModal({ open: true, brand });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === "brand") {
        await deleteBrand({ storeId, id: deleteConfirm.id }).unwrap();
        toast.success(`Brand "${deleteConfirm.name}" deleted.`);
      } else {
        await deleteCategory({ storeId, id: deleteConfirm.id }).unwrap();
        toast.success(`Category "${deleteConfirm.name}" deleted.`);
      }
      if (store) {
        await revalidateStorefrontForStore(store, { scope: "all" });
      }
      refetchCats();
      refetchBrands();
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete entity");
    } finally {
      setSaving(false);
    }
  };

  const genSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Catalog Management</h1>
            <Badge variant="outline" className="text-xs bg-zinc-50 border-zinc-200">
              {rootCategories.length} Categories · {subcategories.length} Subcategories · {allBrands.length} Brands
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Organize products into hierarchical categories, subcategories, and official brand collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "categories" && (
            <Button
              type="button"
              onClick={() => handleOpenAddCategory(false)}
              className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Category
            </Button>
          )}

          {activeTab === "subcategories" && (
            <Button
              type="button"
              onClick={() => handleOpenAddCategory(true)}
              className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Subcategory
            </Button>
          )}

          {activeTab === "brands" && (
            <Button
              type="button"
              onClick={handleOpenAddBrand}
              className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Brand
            </Button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("categories");
              setSearchTerm("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({rootCategories.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("subcategories");
              setSearchTerm("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "subcategories"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Subcategories ({subcategories.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("brands");
              setSearchTerm("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "brands"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Award className="w-4 h-4" />
            Brands ({allBrands.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5 pb-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>

          {activeTab === "subcategories" && (
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700"
            >
              <option value="all">All Parent Categories</option>
              {rootCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── TAB 1: CATEGORIES TABLE ── */}
      {activeTab === "categories" && (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xl shadow-zinc-900/5">
          {loadingCats ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : filteredRootCategories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Layers className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-800">No categories found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {searchTerm ? "Try clearing your search query" : "Create your first category to get started."}
              </p>
              {!searchTerm && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleOpenAddCategory(false)}
                  className="mt-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Subcategories</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRootCategories.map((cat) => {
                  const subCount = subcategories.filter((s) => s.parentId === cat._id).length;
                  return (
                    <tr key={cat._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                            {cat.imageUrl ? (
                              <SmartImage src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-zinc-300">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">{cat.name}</span>
                            {cat.description && (
                              <span className="text-[11px] text-zinc-400 line-clamp-1">{cat.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">/{cat.slug}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[11px] bg-zinc-50 border-zinc-200">
                          {cat.subcategoryCount ?? subCount} Subcategories
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-700">
                          <Package className="w-3 h-3 text-zinc-400" />
                          {cat.productCount ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {cat.active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Edit Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: "category",
                                id: cat._id,
                                name: cat.name,
                                productCount: cat.productCount ?? 0,
                                subCount: cat.subcategoryCount ?? subCount,
                              })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB 2: SUBCATEGORIES TABLE ── */}
      {activeTab === "subcategories" && (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xl shadow-zinc-900/5">
          {loadingCats ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FolderTree className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-800">No subcategories found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Create a subcategory under an existing parent category.
              </p>
              {!searchTerm && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleOpenAddCategory(true)}
                  className="mt-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Subcategory
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSubcategories.map((sub) => {
                  const parent = rootCategories.find((r) => r._id === sub.parentId);
                  return (
                    <tr key={sub._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                            {sub.imageUrl ? (
                              <SmartImage src={sub.imageUrl} alt={sub.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-zinc-300">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">{sub.name}</span>
                            {sub.description && (
                              <span className="text-[11px] text-zinc-400 line-clamp-1">{sub.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[11px] bg-blue-50/60 text-blue-700 border-blue-200">
                          {parent?.name || "Root"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">/{sub.slug}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-700">
                          <Package className="w-3 h-3 text-zinc-400" />
                          {sub.productCount ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(sub)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Edit Subcategory"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: "subcategory",
                                id: sub._id,
                                name: sub.name,
                                productCount: sub.productCount ?? 0,
                              })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB 3: BRANDS TABLE ── */}
      {activeTab === "brands" && (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xl shadow-zinc-900/5">
          {loadingBrands ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Award className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-800">No brands found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Add partner brands and authorized distributors for your catalog.
              </p>
              {!searchTerm && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenAddBrand}
                  className="mt-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Brand
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Logo & Brand</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredBrands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80 p-1 flex items-center justify-center">
                          {brand.logoUrl ? (
                            <SmartImage src={brand.logoUrl} alt={brand.name} fill className="object-contain p-1" />
                          ) : (
                            <Award className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900 block">{brand.name}</span>
                          {brand.description && (
                            <span className="text-[11px] text-zinc-400 line-clamp-1">{brand.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">/{brand.slug}</td>
                    <td className="py-3.5 px-4">
                      {brand.website ? (
                        <a
                          href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-[11px]"
                        >
                          <Globe className="w-3 h-3" />
                          {brand.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-zinc-700">
                        <Package className="w-3 h-3 text-zinc-400" />
                        {brand.productCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {brand.active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-zinc-500 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBrand(brand)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          title="Edit Brand"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              type: "brand",
                              id: brand._id,
                              name: brand.name,
                              productCount: brand.productCount ?? 0,
                            })
                          }
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Category & Subcategory Form Modal ── */}
      {categoryModal.open && (
        <CategoryModal
          storeId={storeId}
          billingHref={billingHref || "#"}
          isSubcategory={categoryModal.isSubcategory}
          category={categoryModal.category}
          rootCategories={rootCategories}
          onClose={() => setCategoryModal({ open: false, isSubcategory: false, category: null })}
          onSuccess={async () => {
            refetchCats();
            setCategoryModal({ open: false, isSubcategory: false, category: null });
            if (store) {
              await revalidateStorefrontForStore(store, { scope: "all" });
            }
          }}
        />
      )}

      {/* ── Brand Form Modal ── */}
      {brandModal.open && (
        <BrandModal
          storeId={storeId}
          billingHref={billingHref || "#"}
          brand={brandModal.brand}
          onClose={() => setBrandModal({ open: false, brand: null })}
          onSuccess={async () => {
            refetchBrands();
            setBrandModal({ open: false, brand: null });
            if (store) {
              await revalidateStorefrontForStore(store, { scope: "all" });
            }
          }}
        />
      )}

      {/* ── Safe Delete Protection Modal ── */}
      {deleteConfirm?.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  Delete {deleteConfirm.type === "brand" ? "Brand" : "Category"}?
                </h3>
                <p className="text-xs text-zinc-500">"{deleteConfirm.name}"</p>
              </div>
            </div>

            {(deleteConfirm.productCount > 0 || (deleteConfirm.subCount ?? 0) > 0) && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Notice linked items:</p>
                {deleteConfirm.productCount > 0 && (
                  <p>• {deleteConfirm.productCount} product(s) currently linked.</p>
                )}
                {(deleteConfirm.subCount ?? 0) > 0 && (
                  <p>• {deleteConfirm.subCount} subcategory(ies) under this category.</p>
                )}
                <p className="text-[11px] text-amber-700/90 pt-1">
                  Deleting will safely unlink these products without deleting the products themselves.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Component: Category Form Modal ──────────────────────────────────────
function CategoryModal({
  storeId,
  billingHref = "#",
  isSubcategory,
  category,
  rootCategories,
  onClose,
  onSuccess,
}: {
  storeId: string;
  billingHref?: string;
  isSubcategory: boolean;
  category: Category | null;
  rootCategories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [parentId, setParentId] = useState<string>(category?.parentId || rootCategories[0]?._id || "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || "");
  const [imageId, setImageId] = useState<string | null>(category?.imageId || null);
  const [active, setActive] = useState(category?.active !== false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    setSaving(true);
    try {
      if (category) {
        await updateCategory({
          storeId,
          id: category._id,
          data: {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim(),
            parentId: isSubcategory ? parentId || null : null,
            imageUrl,
            imageId,
            active,
          },
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory({
          storeId,
          data: {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim(),
            parentId: isSubcategory ? parentId || null : null,
            imageUrl,
            imageId,
            active,
          },
        }).unwrap();
        toast.success("Category created successfully");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-base text-zinc-900">
            {category ? `Edit ${isSubcategory ? "Subcategory" : "Category"}` : `Add New ${isSubcategory ? "Subcategory" : "Category"}`}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSubcategory && (
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Parent Category *</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {rootCategories.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Name *</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!category) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }
              }}
              placeholder="e.g. Electronics"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Slug (URL)</label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. raw-honey"
              className="text-xs font-mono h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description for category..."
              className="w-full rounded-lg border border-zinc-200 p-2 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Category Image</label>
            <MediaPicker
              storeId={storeId}
              billingHref={billingHref || "#"}
              value={imageUrl}
              onChange={(sel) => {
                if (typeof sel === "string") {
                  setImageUrl(sel);
                } else if (sel) {
                  setImageUrl(sel.url || "");
                  setImageId(sel.mediaId || null);
                } else {
                  setImageUrl("");
                  setImageId(null);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCat"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900"
            />
            <label htmlFor="activeCat" className="text-zinc-700 font-medium cursor-pointer">
              Active in storefront catalog
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              {category ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-Component: Brand Form Modal ─────────────────────────────────────────
function BrandModal({
  storeId,
  billingHref = "#",
  brand,
  onClose,
  onSuccess,
}: {
  storeId: string;
  billingHref?: string;
  brand: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();

  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [website, setWebsite] = useState(brand?.website || "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "");
  const [logoId, setLogoId] = useState<string | null>(brand?.logoId || null);
  const [active, setActive] = useState(brand?.active !== false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    setSaving(true);
    try {
      if (brand) {
        await updateBrand({
          storeId,
          id: brand._id,
          data: {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim(),
            website: website.trim(),
            logoUrl,
            logoId,
            active,
          },
        }).unwrap();
        toast.success("Brand updated successfully");
      } else {
        await createBrand({
          storeId,
          data: {
            name: name.trim(),
            slug: finalSlug,
            description: description.trim(),
            website: website.trim(),
            logoUrl,
            logoId,
            active,
          },
        }).unwrap();
        toast.success("Brand created successfully");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-base text-zinc-900">{brand ? "Edit Brand" : "Add New Brand"}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Brand Name *</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!brand) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }
              }}
              placeholder="e.g. Honeyraj"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Slug (URL)</label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. honeyraj"
              className="text-xs font-mono h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Website URL</label>
            <Input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://honeyraj.com"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brand biography and heritage..."
              className="w-full rounded-lg border border-zinc-200 p-2 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Brand Logo</label>
            <MediaPicker
              storeId={storeId}
              billingHref={billingHref || "#"}
              value={logoUrl}
              onChange={(sel) => {
                if (typeof sel === "string") {
                  setLogoUrl(sel);
                } else if (sel) {
                  setLogoUrl(sel.url || "");
                  setLogoId(sel.mediaId || null);
                } else {
                  setLogoUrl("");
                  setLogoId(null);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeBrand"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900"
            />
            <label htmlFor="activeBrand" className="text-zinc-700 font-medium cursor-pointer">
              Active in storefront catalog & brand showcases
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              {brand ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
