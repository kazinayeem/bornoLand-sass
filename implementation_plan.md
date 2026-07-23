# Comprehensive UI/UX Redesign Plan with shadcn/ui & Central Token System

## Overview
This updated plan presents the complete UI/UX modernization of the **BornoLand SaaS** platform (`@bornoland/web`) using **shadcn/ui**, a **central Token-based design architecture (No Hardcoding)**, and design visual inspiration drawn from **[zatiqeasy.com](https://zatiqeasy.com/)**.

**Strict Guarantee**: All business logic, hooks, state management, API routes, database queries, authentication handlers, event callbacks, drag-and-drop mechanics, and prop interfaces will remain **100% untouched**. Only presentation-layer code (JSX/TSX structure, styling class names, visual hierarchy, layout alignment, typography scale, micro-interactions, and shadcn component wrappers) will be updated.

---

## 1. Central Design Token Architecture (No Hardcoding Policy)

To eliminate hardcoded inline styles, ad-hoc raw pixel values (`p-[13px]`, `h-[342px]`), magic numbers, raw hex colors (`#155dfc`), or one-off conditional class strings, **all visual properties are centralized into single-source tokens**:

### A. Central Token Definitions (`globals.css` + `tailwind.config.ts`)
All color scales, typography levels, spacing tokens, shadow depths, border radii, and transition curves will be registered inside `globals.css` (`@theme` / `:root`) and mapped in `tailwind.config.ts`.

#### Design Tokens Derived from [zatiqeasy.com](https://zatiqeasy.com/) Visual Aesthetics:
- **Color Tokens**:
  - `--background`: Light soft blue-tint parchment (`#f4f7fc` in light mode; sleek midnight slate `#090d16` in dark mode).
  - `--card`: Crisp white `#ffffff` (light) / deep slate `#111827` (dark) with 1px subtle hairline border.
  - `--primary`: Electric Royal Blue (`#155dfc` / `#2563eb` in light; `#3b82f6` in dark).
  - `--primary-hover`: Deep royal blue (`#0d47a1` / `#1d4ed8`).
  - `--secondary`: Soft sky pearl (`#e0edff` / `#f0f6ff`).
  - `--accent`: Emerald green accent (`#10b981` / `#059669`) for active shop indicators, sales highlights, and live pill badges.
  - `--muted-foreground`: Slate neutral (`#64748b` in light; `#94a3b8` in dark).
  - `--border`: Clean hairline border (`#e2e8f0` in light; `#1e293b` in dark).
- **Border Radius Scale**:
  - `--radius-sm`: `6px` (badges, small tags)
  - `--radius-md`: `10px` (inputs, buttons, select triggers)
  - `--radius-lg`: `16px` (cards, stats panels, modals)
  - `--radius-xl`: `24px` (hero section banners, container blocks)
  - `--radius-full`: `9999px` (pill CTA buttons, status badges)
- **Shadow Scale**:
  - `--shadow-card`: `0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`
  - `--shadow-floating`: `0 12px 32px -4px rgba(21, 93, 252, 0.12)`
  - `--shadow-button`: `0 2px 4px 0 rgba(21, 93, 252, 0.2)`

### B. Standardized `cva` Variant Patterns
All reusable component variants (Button, Card, Badge, Input, Select, Table, Modal) will use `class-variance-authority` (`cva`) to encapsulate layout sizes, color variants, and states — ensuring **zero duplicate inline class strings** across the codebase.

---

## 2. Mandatory shadcn/ui Component Coverage (100% Adoption)

Every page and module across the platform will exclusively use shadcn/ui components:

| Feature Area | Legacy / Native HTML Elements | Standardized shadcn/ui Component Replacement |
| :--- | :--- | :--- |
| **Buttons & CTAs** | `<button>`, native `<a>` tags | `src/components/ui/button.tsx` (shadcn Button with `cva` variants: default, outline, secondary, ghost, pill-cta) |
| **Forms & Controls** | Native `<input>`, `<select>`, `<textarea>`, `<checkbox>` | `src/components/ui/input.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`, `switch.tsx` |
| **Modals & Overlays** | Custom modal divs, native alerts | `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/alert-dialog.tsx` |
| **Tables & Data Grids** | Native `<table>`, `<thead>`, `<tbody>`, `<tr>` | `src/components/ui/table.tsx` (shadcn Table elements: TableHeader, TableRow, TableCell) |
| **Navigation & Tabs** | Custom state tabs, inline buttons | `src/components/ui/tabs.tsx` (Radix Tabs), `src/components/ui/dropdown-menu.tsx` |
| **Badges & Statuses** | Hardcoded `<span>` badges | `src/components/ui/badge.tsx` (cva variants: primary, secondary, outline, emerald, destructive) |
| **Cards & Panels** | Custom styled `<div>` containers | `src/components/ui/card.tsx` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter) |
| **Avatars & Profiles** | Raw `<img>` tags | `src/components/ui/avatar.tsx` (Radix Avatar with fallback initial badges) |
| **Tooltips & Popovers** | Custom tooltips, raw titles | `src/components/ui/tooltip.tsx`, `src/components/ui/popover.tsx` |
| **Loaders & Skeletons** | Ad-hoc spinner divs | `src/components/ui/skeleton.tsx` (Pulse shimmer loaders) |

---

## 3. Page-by-Page & Module Redesign Execution Plan

### A. Public Landing Page & Site (`src/app/page.tsx` & `src/components/landing/*`)
- **Visual Style (zatiqeasy.com inspired)**: Soft blue parchment background (`bg-background`), electric blue CTA pills (`Button`), metric stat cards (`Card`), pill status badges (`Badge`), smooth rounded section dividers.
- **Header & Navigation** (`header.tsx`): Frosted backdrop glass navbar consuming token variables, shadcn `Button` links, and Radix mobile `Sheet` drawer.
- **Hero & Showcase** (`hero.tsx`, `dashboard-showcase.tsx`): Center-aligned display headings using design typography tokens, pill badge (`Badge`), primary electric CTA button with hover arrow animation, floating metric stats built with shadcn `Card`.
- **Feature & Toolkit Grid** (`features.tsx`, `growth-sections.tsx`, `how-it-works.tsx`, `analytics-section.tsx`, `store-builder.tsx`): Replace raw card containers with shadcn `Card` + `cva` border tokens.
- **Pricing & Testimonials** (`pricing.tsx`, `testimonials.tsx`): shadcn `Card` with highlighted popular tier, `Tabs` / `Switch` for monthly/annual toggling.
- **FAQ & Footer** (`faq.tsx`, `footer.tsx`): Radix-powered `Accordion` / shadcn elements with crisp typography and clean link hierarchy.

### B. Authentication Pages (`src/app/(auth)/*` & `src/components/auth/*`)
- **Pages**: `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `unauthorized`, `admin/login`.
- **Redesign Strategy**:
  - Encapsulate auth forms in styled shadcn `Card` with zatiqeasy-inspired blue accent glow.
  - Form fields use shadcn `Input`, `Label`, `Button`, and `Alert` for inline state feedback.
  - Zero hardcoded colors/px; full dark mode token compatibility.

### C. Multi-Tenant Dashboard (`src/app/(dashboard)/dashboard/*` & `src/components/dashboard/*`, `src/components/store-dashboard/*`)
- **Shell & Navigation**:
  - `DashboardHeader` & `StoreSidebar`: Styled with tokens, collapsible items, clean active state indicators, shadcn `DropdownMenu` for user profile & store switcher.
- **Analytics & Stats**:
  - `visitors-analytics-panel.tsx`, `page.tsx`: Standardized `Card` stat metrics, emerald `Badge` trend tags, tokenized recharts wrappers.
- **Management Sub-Pages** (`orders`, `products`, `categories`, `cms`, `stores`, `billing`, `settings`, `team`):
  - 100% conversion of data tables to shadcn `Table` primitives (`TableHeader`, `TableRow`, `TableCell`).
  - Filters and search bars using shadcn `Input`, `Select`, and `Button`.
  - Actions & confirmations using shadcn `Dialog` and `DropdownMenu`.

### D. Super Admin Platform (`src/app/admin/dashboard/*` & `src/components/admin/*`)
- **Shell & Navigation**:
  - `AdminShell`, `AdminSidebar`, `AdminHeader`, `AdminTabs`: Unified administrative visual language with tokenized dark/light surfaces.
- **Admin Sub-Pages** (`users`, `stores`, `subscriptions`, `payments`, `invoices`, `plans`, `roles`, `security`, `audit-center`, `domains`, `support`):
  - Replace legacy tables, action toolbars, and settings forms with standardized shadcn `Card`, `Table`, `Tabs`, `Badge`, `Switch`, `Select`, and `Dialog`.

### E. Storefront & Customer Portal (`src/app/(store)/store/[storeSlug]/*` & `src/components/storefront/*`)
- **Components**: `product-card.tsx`, `cart-drawer.tsx`, `quick-view-modal.tsx`, `storefront-product-grid.tsx`, `customer-account-shell.tsx`.
- **Redesign Strategy**:
  - Replace custom drawer overlay with Radix `Sheet` in `cart-drawer.tsx`.
  - Replace custom modal with Radix `Dialog` in `quick-view-modal.tsx`.
  - Product cards use tokenized `Card` with image hover scaling, price badges using `Badge`, and primary CTA buttons.

### F. Visual Store Builder (`src/components/builder/*` & `src/app/(dashboard)/dashboard/builder/*`)
- **Components**: `builder-toolbar.tsx`, `builder-sidebar.tsx`, `properties-panel.tsx`, `layers-panel.tsx`, `section-library-modal.tsx`.
- **Redesign Strategy**:
  - Replace control property inputs (number inputs, select dropdowns, toggles, color pickers, tab triggers) with shadcn primitives (`Input`, `Select`, `Switch`, `Tabs`, `Dialog`).
  - **Zero touch** on dnd-kit drag-and-drop bindings, frame postMessages, or section registry logic.

---

## 4. Order of Incremental Execution

1. **Phase 1: Token System Setup & Dependency Installation**
   - Update `globals.css` and `tailwind.config.ts` with central token variables (colors, spacing, radius, shadows, typography) extracted from [zatiqeasy.com](https://zatiqeasy.com/).
   - Install missing Radix & shadcn primitives (`@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-separator`, `cmdk`).
   - Create/upgrade standard primitives in `src/components/ui/` (`select.tsx`, `table.tsx`, `tabs.tsx`, `dialog.tsx`, `tooltip.tsx`, `avatar.tsx`, `switch.tsx`, `checkbox.tsx`, `alert.tsx`).

2. **Phase 2: Authentication Pages**
   - Redesign login, register, password reset, email verification, and admin login screens.

3. **Phase 3: Public Landing Site**
   - Redesign Header, Hero, Trust Bar, Features, Toolkit, Pricing, Testimonials, FAQ, and Footer using zatiqeasy-inspired tokenized components.

4. **Phase 4: Multi-Tenant Dashboard**
   - Redesign Dashboard Shell, Header, Sidebars, Overview stats, and Management tables/forms.

5. **Phase 5: Super Admin Platform**
   - Modernize Admin Shell, Sidebar, Header, and all Admin sub-pages.

6. **Phase 6: Storefront & Store Builder UI**
   - Convert Cart Drawer to `Sheet`, Quick View to `Dialog`, product cards to `Card`, and Builder controls to shadcn inputs.

7. **Phase 7: Typecheck & Build Verification**
   - Run `pnpm --filter @bornoland/web typecheck` and `pnpm --filter @bornoland/web build` to verify zero TypeScript errors and complete functional stability.

---

## 5. Risk Analysis & Mitigation Strategy

| Risk Area | Mitigation Strategy |
| :--- | :--- |
| **Hardcoding leakage** in existing legacy components | Perform audit across updated files; enforce utility tokens (`bg-background`, `text-muted-foreground`, `rounded-lg`, `shadow-card`, etc.) and `cva` variants exclusively. |
| **Logic breakage during UI wrapping** | Retain all existing event handlers (`onClick`, `onChange`, `onSubmit`), state hooks, Redux/Zustand bindings, and prop types intact. |
| **Visual mismatch across modules** | Every component will consume the identical `globals.css` token set, guaranteeing 100% design consistency. |
| **Builder drag-and-drop interference** | Keep all `dnd-kit` context providers, refs, draggable handle attributes, and state reducers completely untouched. |

---

## 6. Verification Plan

### Automated Verification
- `pnpm --filter @bornoland/web typecheck` (verifies zero compilation or prop errors).
- `pnpm --filter @bornoland/web build` (verifies clean production build).

### Manual Verification
- Inspect desktop, tablet, and mobile layouts for responsive consistency.
- Verify light and dark mode token contrast.
- Test interactive modals, drawers, tabs, and forms across all modules.
