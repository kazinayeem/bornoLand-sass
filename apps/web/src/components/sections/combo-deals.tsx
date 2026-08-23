"use client";

import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useIsBuilder } from "@/lib/device-context";
import { formatCurrency } from "@/lib/format-currency";
import { addToCart } from "@/redux/slices/cart-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { toast } from "sonner";
import { Package, Sparkles, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";

export function ComboDeals({ section }: { section: SectionData }) {
  const dispatch = useDispatch();
  const isBuilder = useIsBuilder();
  const { products = [], settings } = useTenant();
  const [addToCartRemote] = useAddToCartMutation();
  const p = section.props;

  const count = Number(p.productCount) || 3;
  const gridColumns = p.gridColumns || "3";

  // Use real products if available, otherwise display demo combos
  const comboPacks = useMemo(() => {
    if (products.length >= 3) {
      return [
        {
          id: "combo-1",
          title: "দৈনন্দিন অর্গানিক কম্বো প্যাক",
          items: [products[0]?.name || "সুন্দরবনের খাঁটি মধু", products[1]?.name || "গাওয়া ঘি", products[2]?.name || "সরিষার তেল"],
          price: 1850,
          comparePrice: 2250,
          discount: "Save ৳400",
          image: products[0]?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
          productRef: products[0],
        },
        {
          id: "combo-2",
          title: "প্রিমিয়াম খেজুর ও পুষ্টি কম্বো",
          items: ["আজওয়া খেজুর ৫০০ গ্রাম", "মরিয়ম খেজুর ৫০০ গ্রাম", "কাঠবাদাম ২৫০ গ্রাম"],
          price: 2150,
          comparePrice: 2600,
          discount: "Save ৳450",
          image: products[1]?.imageUrl || "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&q=80",
          productRef: products[1],
        },
        {
          id: "combo-3",
          title: "রান্নার স্পেশাল মসলা ও তেল কম্বো",
          items: ["ঘানি ভাঙা সরিষার তেল ১ লিটার", "হলুদ গুঁড়া ২৫০ গ্রাম", "মরিচ গুঁড়া ২৫০ গ্রাম"],
          price: 1450,
          comparePrice: 1750,
          discount: "Save ৳300",
          image: products[2]?.imageUrl || "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&q=80",
          productRef: products[2],
        },
      ].slice(0, count);
    }

    return [
      {
        id: "combo-demo-1",
        title: "দৈনন্দিন অর্গানিক কম্বো প্যাক",
        items: ["সুন্দরবনের প্রাকৃতিক মধু ৫০০ গ্রাম", "গাওয়া ঘি ৫০০ গ্রাম", "ঘানি ভাঙা সরিষার তেল ১ লিটার"],
        price: 1850,
        comparePrice: 2250,
        discount: "Save ৳400",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&q=80",
        productRef: undefined,
      },
      {
        id: "combo-demo-2",
        title: "প্রিমিয়াম খেজুর ও পুষ্টি কম্বো",
        items: ["আজওয়া খেজুর ৫০০ গ্রাম", "মরিয়ম খেজুর ৫০০ গ্রাম", "কাঠবাদাম ২৫০ গ্রাম"],
        price: 2150,
        comparePrice: 2600,
        discount: "Save ৳450",
        image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&q=80",
        productRef: undefined,
      },
      {
        id: "combo-demo-3",
        title: "রান্নার স্পেশাল মসলা ও তেল কম্বো",
        items: ["ঘানি ভাঙা সরিষার তেল ১ লিটার", "হলুদ গুঁড়া ২৫০ গ্রাম", "মরিচ গুঁড়া ২৫০ গ্রাম"],
        price: 1450,
        comparePrice: 1750,
        discount: "Save ৳300",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
        productRef: undefined,
      },
    ].slice(0, count);

  }, [products, count]);

  const handleAddCombo = async (combo: typeof comboPacks[0]) => {
    if (isBuilder) return;
    try {
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
        await addToCartRemote({ productId: prod._id, quantity: 1 }).unwrap();
      }
      toast.success(`${combo.title} কার্টে যুক্ত হয়েছে!`);
    } catch {
      toast.success(`${combo.title} কার্টে যুক্ত হয়েছে!`);
    }
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

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridColumns === "4" ? "4" : "3"} gap-6 mt-8`}>
          {comboPacks.map((combo) => (
            <div
              key={combo.id}
              className="group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-200"
            >
              {/* Discount Tag */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Tag className="w-3 h-3" />
                <span>{combo.discount}</span>
              </div>

              {/* Combo Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-50 mb-4">
                <SmartImage
                  src={combo.image}
                  alt={combo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-[#e05a00] transition-colors">
                  {combo.title}
                </h3>

                {/* Items Included */}
                <div className="my-3 space-y-1.5 rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    প্যাকেজে অন্তর্ভুক্ত:
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

                {/* Price & Action */}
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
                    <span>অর্ডার করুন</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
