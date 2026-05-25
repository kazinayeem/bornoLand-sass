"use client";

import { useTenant } from "@/providers/tenant-provider";
import { Ruler } from "lucide-react";

export default function SizeGuidePage() {
  const { theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  const sizes = [
    { size: "XS", chest: "32-34", waist: "26-28", hip: "32-34" },
    { size: "S", chest: "34-36", waist: "28-30", hip: "34-36" },
    { size: "M", chest: "36-38", waist: "30-32", hip: "36-38" },
    { size: "L", chest: "38-40", waist: "32-34", hip: "38-40" },
    { size: "XL", chest: "40-42", waist: "34-36", hip: "40-42" },
    { size: "2XL", chest: "42-44", waist: "36-38", hip: "42-44" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}12` }}>
          <Ruler className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Size Guide</h1>
      </div>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
              <th className="px-4 py-3 text-left font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Size</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Chest (in)</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Waist (in)</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Hip (in)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={s.size} className="border-t" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: i % 2 === 0 ? "transparent" : (isDark ? "#18181b" : "#fafafa") }}>
                <td className="px-4 py-3 font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{s.size}</td>
                <td className="px-4 py-3" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{s.chest}</td>
                <td className="px-4 py-3" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{s.waist}</td>
                <td className="px-4 py-3" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{s.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Measurements may vary by product. Check individual product descriptions for specific sizing information.</p>
    </div>
  );
}
