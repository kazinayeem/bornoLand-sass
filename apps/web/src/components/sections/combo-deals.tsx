"use client";

import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useSectionProducts } from "@/hooks/use-section-products";
import { useTenant } from "@/providers/tenant-provider";
import { useIsBuilder } from "@/lib/device-context";
import { formatCurrency } from "@/lib/format-currency";
import { addToCart } from "@/redux/slices/cart-slice";
import { toast } from "sonner";
import { Package, ShoppingBag, Tag } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";

type ComboItem = {
  id?: string;
  title?: string;
  items?: string[];
  price?: number;
  comparePrice?: number;
  discount?: string;
  image?: string;
};

export function ComboDeals({ section }: { section: SectionData }) {
  const dispatch = useDispatch();
  const isBuilder = useIsBuilder();
  const p = section.props;
  const { settings } = useTenant();
  const { products } = useSectionProducts({ sectionType: section.type, props: p });

  const count = Number(p.productCount) || 3;
  const gridColumns = p.gridColumns || "3";

  const comboPacks = useMemo(() => {
    const rawItems = (p.comboItems as unknown as ComboItem[] | undefined) ?? [];

    if (rawItems.length > 0) {
      return rawItems.map((item, i) => ({
        id: item.id || `combo-${i}`,
        title: item.title || `Combo ${i + 1}`,
        items: item.items || [],
        price: item.price || 0,
        comparePrice: item.comparePrice,
        discount: item.discount || "",
        image: item.image || "",
        productRef: undefined,
      })).slice(0, count);
    }

    if (products.length >= 3) {
      return products.slice(0, count).map((prod, i) => ({
        id: prod._id || `combo-${i}`,
        title: prod.name || `Combo ${i + 1}`,
        items: [prod.name],
        price: prod.price || 0,
        comparePrice: prod.comparePrice,
        discount: "",
        image: prod.imageUrl || "",
        productRef: prod,
      }));
    }

    return [];
  }, [p.comboItems, products, count]);

  const handleAddCombo = (combo: (typeof comboPacks)[0]) => {
    if (isBuilder) return;
    const prod = combo.productRef || products[0];
    if (prod) {
      dispatch(
        addToCart({
          productId: prod._id,
          name: combo.title,
          price: combo.price,
          quantity: 1,
          image: combo.image,
        }),
      );
    }
    toast.success(`${combo.title} added to cart!`);
  };

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionTitle
          title={p.title || "Exclusive Combo Deals"}
          subtitle={p.subtitle || "Save more with our bundled packages"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        {comboPacks.length > 0 ? (
          <ColumnGrid columns={gridColumns}>
            {comboPacks.map((combo) => (
              <div
                key={combo.id}
                className="group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-200"
              >
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  <Tag className="w-3 h-3" />
                  <span>{combo.discount}</span>
                </div>

                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-50 mb-4">
                  <SmartImage
                    src={combo.image}
                    alt={combo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-[#e05a00] transition-colors">
                    {combo.title}
                  </h3>

                  {combo.items.length > 0 && (
                    <div className="my-3 space-y-1.5 rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        {p.includesLabel || "Includes:"}
                      </span>
                      <ul className="text-xs text-zinc-600 space-y-1">
                        {combo.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#055c3a]" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-lg text-[#055c3a]">
                          {formatCurrency(combo.price, settings)}
                        </span>
                        {combo.comparePrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {formatCurrency(combo.comparePrice, settings)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCombo(combo)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#e05a00] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#c2410c] active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{p.orderButtonText || "Add to Cart"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </ColumnGrid>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <Package className="h-10 w-10 text-zinc-300 mb-3" />
            <h4 className="text-sm font-semibold text-zinc-700">{p.emptyTitle || "No combo deals yet"}</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {p.emptyDescription || "Create combo deals in the Content tab to showcase bundled products."}
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
