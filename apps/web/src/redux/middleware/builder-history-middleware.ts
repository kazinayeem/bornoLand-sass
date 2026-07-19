import type { Middleware } from "@reduxjs/toolkit";
import { BUILDER_HISTORY_ACTIONS, commitHistory, cloneSections } from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";

type GlobalSnapshot = {
  sections: BuilderSection[];
  headerSections: BuilderSection[];
  footerSections: BuilderSection[];
};

/** Automatically captures a before-snapshot and commits history for section-mutating actions. */
export const builderHistoryMiddleware: Middleware = (api) => (next) => (action) => {
  if (BUILDER_HISTORY_ACTIONS.has((action as { type: string }).type)) {
    const builder = (api.getState() as Record<string, unknown>).builder as {
      sections: BuilderSection[];
      headerSections: BuilderSection[];
      footerSections: BuilderSection[];
    };
    const snapshot: GlobalSnapshot = {
      sections: cloneSections(builder.sections),
      headerSections: cloneSections(builder.headerSections),
      footerSections: cloneSections(builder.footerSections),
    };
    const result = next(action);
    api.dispatch(commitHistory(snapshot));
    return result;
  }
  return next(action);
};
