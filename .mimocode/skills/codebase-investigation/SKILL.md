---
name: codebase-investigation
description: Systematic codebase investigation for bugs, feature locations, or architecture understanding. Traces event flows, component hierarchies, and state management to find root causes.
---

# Codebase Investigation

A repeatable workflow for investigating bugs, locating features, or understanding unfamiliar code sections in this project.

## When to Use

- A UI component is broken and you need to find the root cause
- You need to trace how a feature works end-to-end (event flow, state, rendering)
- You're exploring an unfamiliar part of the codebase for the first time
- The user reports a bug with specific symptoms and you need to audit the full system

## Workflow

### Phase 1 — Orient (2-3 minutes)

1. **Read the project root** to understand the high-level structure
2. **Read package.json** (or equivalent) to identify the tech stack and key dependencies
3. **Identify the relevant app/module** — in this monorepo, check `apps/web/src/` or `apps/api/`

### Phase 2 — Map the Territory (3-5 minutes)

1. **Glob for files by keyword** related to the bug or feature:
   ```
   glob: apps/web/src/**/*{keyword}*
   ```
   Use multiple keyword variants (e.g., `*layer*`, `*context*`, `*dropdown*`, `*builder*`)
2. **List the directory** of the most relevant folder to see sibling files
3. **Build a mental map** of which files are likely involved

### Phase 3 — Deep Read (5-10 minutes)

1. **Read the primary file** the user mentioned (e.g., `layers-panel.tsx`)
2. **Read related components** — imports, shared UI components, parent containers
3. **Read state management** — Redux slices, stores, or context providers involved
4. **Read the component hierarchy** — parent → child → leaf to understand rendering flow

### Phase 4 — Trace the Flow

1. **Follow the event chain**: user interaction → event handler → state update → re-render
2. **Identify where the chain breaks** — the root cause location
3. **Check for common antipatterns**:
   - `stopPropagation()` blocking parent handlers
   - z-index or pointer-events issues
   - Portal rendering conflicts
   - Race conditions in async state updates
   - Missing or incorrect prop passing

### Phase 5 — Document Findings

Report back with:
- **Root cause**: The exact line/behavior causing the issue
- **Files involved**: All files that are part of the system (even if not buggy)
- **Why it broke**: The mechanism of failure
- **Why the fix works**: The rationale for the proposed solution

## Project-Specific Gotchas

- **Builder system**: State lives in `builder-slice.ts`. Sections have 3 zones: `headerSections`, `sections`, `footerSections`. Per-section props include `locked`, `visible`, `favorite`.
- **DropdownMenu**: Portal-based, uses `@floating-ui/react`. The `useClick` hook attaches to the reference div — if a child calls `stopPropagation()`, the menu never opens.
- **PageContextMenu**: Separate system from Builder dropdown. Uses manual x/y positioning + framer-motion. Not the same component.
- **Section registry**: `lib/section-registry.ts` provides `getSectionDef()` and `normalizeSectionType()` for mapping section types to definitions.

## Key Files Reference

| File | Purpose |
|------|---------|
| `apps/web/src/components/builder/layers-panel.tsx` | Section list with drag/drop, three-dot context menu |
| `apps/web/src/components/ui/dropdown-menu.tsx` | Shared DropdownMenu (portal-based, floating-ui) |
| `apps/web/src/redux/slices/builder-slice.ts` | Redux state + actions for builder |
| `apps/web/src/components/builder/builder-shell.tsx` | Store guard + branding wrapper |
| `apps/web/src/components/builder/builder-editor.tsx` | Main builder orchestrator |
| `apps/web/src/components/builder/builder-sidebar.tsx` | Tab rail + panels (layers, pages, templates, media, theme) |
| `apps/web/src/lib/section-registry.ts` | Section type definitions and normalization |

## Stopping Condition

Stop investigating when you have:
1. Identified the exact root cause (file + line + mechanism)
2. Read all files that are part of the affected system
3. Understood the full event/state flow from trigger to render

Do NOT start implementing fixes until the investigation is complete and you can articulate the root cause clearly.
