"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { undoBuilder, redoBuilder, restoreHistorySnapshot } from "@/redux/slices/builder-slice";
import { Clock, Undo2, Redo2 } from "lucide-react";

function formatRelativeTime(iso?: string): string {
  if (!iso) return "Unknown time";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

export function HistoryPanel() {
  const dispatch = useDispatch();
  const historySnapshots = useSelector((s: RootState) => s.builder.past);
  const pastCount = useSelector((s: RootState) => s.builder.past.length);
  const futureCount = useSelector((s: RootState) => s.builder.future.length);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-apple-hairline/60 px-3 py-2">
        <span className="text-[12px] font-semibold text-apple-ink">History</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title="Undo (⌘Z)"
            disabled={pastCount === 0}
            onClick={() => dispatch(undoBuilder())}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink disabled:opacity-25"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo (⌘⇧Z)"
            disabled={futureCount === 0}
            onClick={() => dispatch(redoBuilder())}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink disabled:opacity-25"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {historySnapshots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-apple-hairline p-6 text-center">
            <Clock className="h-6 w-6 text-apple-ink-muted-48" />
            <div>
              <p className="text-sm font-medium text-apple-ink">No history yet</p>
              <p className="mt-0.5 text-[11px] leading-5 text-apple-ink-muted-48">
                Start editing to create snapshots. Use ⌘Z to undo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...historySnapshots].reverse().map((snapshot, index) => {
              const originalIndex = historySnapshots.length - 1 - index;
              const totalSections =
                (snapshot.sections?.length ?? 0) +
                (snapshot.headerSections?.length ?? 0) +
                (snapshot.footerSections?.length ?? 0);
              const isLatest = index === 0;
              return (
                <div
                  key={originalIndex}
                  className={`group rounded-xl border px-3 py-2.5 transition-colors ${isLatest ? "border-apple-primary/20 bg-apple-primary/5" : "border-apple-hairline bg-apple-canvas hover:bg-apple-canvas-parchment/60"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isLatest && (
                          <span className="rounded bg-apple-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-apple-primary">
                            Latest
                          </span>
                        )}
                        <p className="truncate text-[12px] font-medium text-apple-ink">
                          {snapshot.timestamp ? formatRelativeTime(snapshot.timestamp) : `Snapshot ${historySnapshots.length - index}`}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[11px] text-apple-ink-muted-48">
                        {totalSections} section{totalSections !== 1 ? "s" : ""}
                        {snapshot.timestamp && (
                          <span className="ml-1">· {formatTime(snapshot.timestamp)}</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(restoreHistorySnapshot(snapshot))}
                      className="shrink-0 rounded-lg border border-apple-hairline bg-apple-canvas px-2.5 py-1 text-[11px] font-medium text-apple-ink opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:bg-apple-canvas-parchment"
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
