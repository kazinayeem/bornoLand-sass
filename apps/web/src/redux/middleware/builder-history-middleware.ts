import type { Middleware } from "@reduxjs/toolkit";
import { BUILDER_HISTORY_ACTIONS, commitHistory } from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";

type GlobalSnapshot = {
  sections: BuilderSection[];
  headerSections: BuilderSection[];
  footerSections: BuilderSection[];
};

function clone(list: BuilderSection[]): BuilderSection[] {
  return list.map((s) => ({ ...s, props: { ...s.props } }));
}

/** Automatically captures a before-snapshot and commits history for section-mutating actions. */
export const builderHistoryMiddleware: Middleware = (api) => (next) => (action) => {
  if (BUILDER_HISTORY_ACTIONS.has((action as { type: string }).type)) {
    const builder = (api.getState() as Record<string, unknown>).builder as {
      sections: BuilderSection[];
      headerSections: BuilderSection[];
      footerSections: BuilderSection[];
    };
    const snapshot: GlobalSnapshot = {
      sections: clone(builder.sections),
      headerSections: clone(builder.headerSections),
      footerSections: clone(builder.footerSections),
    };
    const result = next(action);
    api.dispatch(commitHistory(snapshot));
    return result;
  }
  return next(action);
};
