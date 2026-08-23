"use client";

import { Component, type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ThemeHeader } from "./theme-header";
import { ThemeFooter } from "./theme-footer";
import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import { BuilderProvider } from "@/components/sections/builder-link";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { AlertTriangle, RefreshCw } from "lucide-react";

class SectionErrorBoundary extends Component<
  { sectionId: string; sectionType: string; children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { sectionId: string; sectionType: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Section error in [${this.props.sectionType}] (${this.props.sectionId}):`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-4 max-w-4xl rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-6 text-center text-amber-900">
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <h4 className="text-sm font-semibold">This section could not be displayed</h4>
            <p className="text-xs text-amber-700/80">
              Type: <code className="font-mono">{this.props.sectionType}</code>
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100/50"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function toSectionData(s: StorefrontSectionLike): SectionData {
  const props: Record<string, string> = {};
  if (s.props) {
    for (const [key, value] of Object.entries(s.props)) {
      props[key] = value == null ? "" : String(value);
    }
  }
  return { id: s.id, type: s.type, visible: s.visible !== false, props, style: s.style };
}

export interface StoreRendererProps {
  themeId?: string | null;
  sections: StorefrontSectionLike[];
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  builderMode?: boolean;
  onSelectSection?: (sectionId: string) => void;
  selectedSectionId?: string | null;
  hoveredSectionId?: string | null;
}

const HEADER_TYPES = new Set(["header", "header-bar", "header-logo", "header-nav", "header-icons"]);
const FOOTER_TYPES = new Set(["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-social", "footer-copyright"]);

export function StoreRenderer({
  themeId,
  sections,
  headerSettings = {},
  footerSettings = {},
  builderMode = false,
}: StoreRendererProps) {
  // Filter out disabled sections and any legacy header/footer sections from the body
  const bodySections = sections.filter((s) => {
    if (s.visible === false) return false;
    const type = s.type?.toLowerCase().trim() || "";
    return !HEADER_TYPES.has(type) && !FOOTER_TYPES.has(type);
  });

  const content = (
    <div className="flex flex-col min-h-screen">
      <ThemeHeader headerSettings={headerSettings} />

      <main className="flex-1">
        {bodySections.map((s) => (
          <SectionErrorBoundary key={s.id} sectionId={s.id} sectionType={s.type}>
            <SectionRenderer section={toSectionData(s)} />
          </SectionErrorBoundary>
        ))}
      </main>

      <ThemeFooter footerSettings={footerSettings} />
    </div>
  );

  return (
    <ThemeProvider themeId={themeId}>
      {builderMode ? <BuilderProvider>{content}</BuilderProvider> : content}
    </ThemeProvider>
  );
}
