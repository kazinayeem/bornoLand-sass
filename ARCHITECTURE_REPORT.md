# BornoLand Builder — Complete Architecture Audit Report

## 1. Executive Summary

The BornoLand Builder is a Next.js 15 + Express 5 monorepo with 60+ MongoDB models, 40+ section types, 20+ Redux slices, and 200+ API endpoints. The core issue is **dual architecture**: an older legacy system (flat routes/controllers/services/PageModel) was partially migrated to a modular system (modules/routes/controllers/services/StorePageModel) but the migration was never completed. Both systems run simultaneously, causing data inconsistency, duplicated state, and synchronization failures.

## 2. Critical Issues

### 2.1 Dual Page Model — CRITICAL

```
PageModel (legacy builder)              StorePageModel (new storefront)
├── storeId                              ├── storeId
├── title, slug                          ├── title, slug
├── pageType: string (no enum)           ├── pageType: ENUM (25 types)
├── status: draft|published|archived     ├── status: draft|published|scheduled|archived
├── sections: [Mixed]                    ├── sections: [Mixed]
├── headerSections, footerSections       ├── headerSections, footerSections
├── headerSettings, footerSettings       ├── headerSettings (rich sub-schema)
                                          ├── footerSettings (rich sub-schema)
                                          ├── seo (rich sub-schema)
                                          ├── settings (rich sub-schema)
                                          ├── globalSectionIds
                                          ├── visibility, isHomePage, sortOrder
                                          ├── parentId (hierarchy)
                                          ├── softDelete
                                          └── versioning/preview tokens
```

- `createStore()` creates 17 pages in BOTH models
- Builder writes to `PageModel`, storefront reads from `StorePageModel`
- Changes in builder are INVISIBLE to storefront and vice versa

### 2.2 Split Builder State — HIGH
- Redux `builder-slice` and Zustand `editor-store.ts` both manage `pageId`, `selectedBlockId`, `blocks`
- Zustand store is never consumed by any component
- Must be removed

### 2.3 Hardcoded Section Dispatch — HIGH
- `section-renderer.tsx` has 40+ `if (type === "xxx") return <Component/>` statements
- Adding a section = edit 3 files (registry, renderer, component file)
- `header-nav` and `header-icons` are placeholder divs, not real components

### 2.4 Manual History Push — HIGH
- Every mutation calls `pushHistory()` manually
- Easy to forget, leading to silent undo breakage
- No history metadata (action type, timestamp)

### 2.5 Navigation-Page Desync — HIGH
- Menu items reference pages by slug
- Renaming a page does NOT update nav items
- Broken links on storefront

### 2.6 No Publish Engine — HIGH
- "Publish" just sets `status: "published"`
- No static generation, version diffing, preview, rollback

## 3. Performance Issues

- No virtual list in layer tree or section library
- All 40+ section components loaded on builder page
- No API response caching (Redis unused)
- `createStore()` is 20+ sequential DB operations in transaction

## 4. Security Issues

- No HTML sanitization in rich text sections (XSS)
- No CSRF tokens
- Section `props` stored as `Mixed` in MongoDB — no validation on save
- Custom CSS/JS fields not sanitized

