"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { restoreHistorySnapshot } from "@/redux/slices/builder-slice";

export function HistoryPanel() {
  const dispatch = useDispatch();
  const historySnapshots = useSelector((s: RootState) => s.builder.past);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-apple-hairline/60 px-3 py-3">
        <h2 className="text-[13px] font-semibold text-apple-ink">History</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {historySnapshots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-apple-hairline p-6 text-center text-sm text-apple-ink-muted-48">
            No history yet. Start editing to create snapshots.
          </div>
        ) : (
          <div className="space-y-2">
            {[...historySnapshots].reverse().map((snapshot, index) => {
              const originalIndex = historySnapshots.length - 1 - index;
              const totalSections =
                (snapshot.sections?.length ?? 0) +
                (snapshot.headerSections?.length ?? 0) +
                (snapshot.footerSections?.length ?? 0);
              return (
                <div
                  key={originalIndex}
                  className="rounded-xl border border-apple-hairline bg-apple-canvas p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-apple-ink">
                        Snapshot {historySnapshots.length - index}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-ink-muted-48">{totalSections} sections</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(restoreHistorySnapshot(snapshot))}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
