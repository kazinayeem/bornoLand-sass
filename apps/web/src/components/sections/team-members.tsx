"use client";

import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";

const sampleTeam = [
  { name: "Alex Morgan", role: "CEO & Founder", img: "" },
  { name: "Sarah Chen", role: "Creative Director", img: "" },
  { name: "Marcus Johnson", role: "Head of Product", img: "" },
  { name: "Emily Davis", role: "Marketing Lead", img: "" },
];

export function TeamMembers({ section }: { section: SectionData }) {
  const p = section.props;
  const count = Number(p.memberCount) || 4;
  const cols = p.columns || "4";
  const members = sampleTeam.slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Our Team"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {members.map((m, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-zinc-100 overflow-hidden">
                {m.img ? (
                  <img src={m.img} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-zinc-400">{m.name.charAt(0)}</div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">{m.name}</h3>
              <p className="text-xs text-zinc-500">{m.role}</p>
              {p.showSocial !== "false" && (
                <div className="mt-2 flex justify-center gap-2">
                  {["𝕏", "in", "📷"].map((s) => (
                    <span key={s} className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
