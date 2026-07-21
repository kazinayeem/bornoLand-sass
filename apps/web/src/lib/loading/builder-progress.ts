/** Paths where the global top progress bar should stay quiet for micro-edits. */
export function isBuilderRoute(pathname: string): boolean {
  return /\/store\/[^/]+\/builder(\/|$)/.test(pathname);
}

/** Mutations that may show the top bar immediately while in the Builder. */
export const BUILDER_TOP_BAR_MUTATION_ENDPOINTS = new Set([
  "publishStorePage",
  "unpublishStorePage",
  "changeStoreTheme",
]);

/** Mutations that must never drive the top bar inside the Builder. */
export const BUILDER_SILENT_MUTATION_ENDPOINTS = new Set([
  "saveStorePageDraft",
  "updateStorePage",
  "createStorePage",
  "duplicateStorePage",
  "deleteStorePage",
  "renameMediaFile",
  "deleteMediaFile",
  "bulkDeleteMedia",
  "replaceMediaFile",
  "importMediaFromUrl",
]);

/** Delay before showing top bar for non-critical Builder mutations (ms). */
export const BUILDER_MUTATION_PROGRESS_DELAY_MS = 500;

export function isIntraBuilderNavigation(fromPath: string, toPath: string): boolean {
  return isBuilderRoute(fromPath) && isBuilderRoute(toPath);
}
