"use client";

import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";

export function TeamMembers({ section }: { section: SectionData }) {
  const p = section.props;
  const cols = p.columns || "4";
  const members = (section.style?.teamMembers ?? []) as { id: string; name: string; role: string; bio: string; image: string; twitter: string; linkedin: string; instagram: string }[];

  if (members.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="px-4 sm:px-6 lg:px-8 py-12 text-center">
          <SectionTitle title={p.title || "Our Team"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          <p className="mt-4 text-sm text-apple-ink-muted-48">No team members yet. Add them in the Content tab.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Our Team"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {members.map((m) => (
            <div key={m.id} className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-zinc-100 overflow-hidden">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-apple-ink-muted-48">{m.name ? m.name.charAt(0) : "?"}</div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-apple-ink">{m.name || "Team Member"}</h3>
              <p className="text-xs text-apple-ink-muted-48">{m.role || ""}</p>
              {p.showSocial !== "false" && (
                <div className="mt-2 flex justify-center gap-2">
                  {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-apple-ink-muted-48 hover:text-apple-ink-muted-80">𝕏</a>}
                  {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-apple-ink-muted-48 hover:text-apple-ink-muted-80">in</a>}
                  {m.instagram && <a href={m.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-apple-ink-muted-48 hover:text-apple-ink-muted-80">📷</a>}
                </div>
              )}
            </div>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
