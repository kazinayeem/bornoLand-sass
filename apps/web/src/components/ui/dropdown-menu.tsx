"use client";

/**
 * DropdownMenu — portal-based, collision-aware, keyboard-navigable.
 *
 * Uses @floating-ui/react for:
 *   • flip   — opens above when there's no room below
 *   • shift  — keeps the menu inside the viewport horizontally
 *   • offset — 6px gap between trigger and menu
 *
 * Renders into document.body via React portal so it is NEVER clipped
 * by overflow:hidden parents, scroll containers, or stacking contexts.
 *
 * Usage:
 *   <DropdownMenu
 *     trigger={<button>...</button>}
 *     items={[
 *       { label: "Edit", icon: Pencil, onClick: () => {} },
 *       { divider: true },
 *       { label: "Delete", icon: Trash2, onClick: () => {}, danger: true },
 *     ]}
 *   />
 */

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  FloatingFocusManager,
  type Placement,
} from "@floating-ui/react";
import { cn } from "@/lib/utils";

// ─── Public Types ──────────────────────────────────────────────────────────────

export type DropdownItem =
  | {
      divider: true;
      key?: string;
    }
  | {
      divider?: false;
      key?: string;
      label: string;
      icon?: React.ComponentType<{ className?: string }>;
      onClick: () => void;
      danger?: boolean;
      warning?: boolean;
      disabled?: boolean;
      /** Small secondary text below the label */
      description?: string;
      /** Badge / chip text on the right */
      badge?: string;
    };

type DropdownMenuProps = {
  /** The element that triggers the dropdown. Will have aria-expanded + aria-haspopup. */
  trigger: ReactNode;
  items: DropdownItem[];
  /** Preferred placement (default: "bottom-end") */
  placement?: Placement;
  /** Extra class on the outer menu panel */
  className?: string;
  /** Minimum width in px (default 192) */
  minWidth?: number;
  /** Disable the whole menu */
  disabled?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DropdownMenu({
  trigger,
  items,
  placement = "bottom-end",
  className,
  minWidth = 192,
  disabled = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackAxisSideDirection: "start", padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

  // Manual click toggle with stopPropagation so parent onClick never interferes.
  // We use useDismiss for outside-click dismissal but manually control
  // the open state via handleTriggerClick instead of useClick.
  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setOpen((prev) => !prev);
  }, [disabled]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        setOpen(false);
        (refs.reference.current as HTMLElement | null)?.focus();
        return;
      }
      const focused = document.activeElement as HTMLElement | null;
      const buttons = Array.from(
        (refs.floating.current as HTMLElement | null)?.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled])'
        ) ?? []
      );
      const idx = buttons.indexOf(focused as HTMLButtonElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        buttons[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
      }
    },
    [refs]
  );

  const handleItemClick = useCallback(
    (item: Extract<DropdownItem, { label: string }>) => {
      if (item.disabled) return;
      setOpen(false);
      item.onClick();
    },
    []
  );

  return (
    <>
      <div
        ref={refs.setReference}
        className="inline-flex"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleTriggerClick}
      >
        {trigger}
      </div>

      {typeof document !== "undefined" && open && createPortal(
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          <div
            ref={refs.setFloating}
            id={menuId}
            style={{ ...floatingStyles, minWidth, zIndex: 9999 }}
            onKeyDown={handleKeyDown}
            className={cn(
              "rounded-lg border border-apple-hairline bg-apple-canvas py-1.5 outline-none dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2",
              className
            )}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key ?? `divider-${index}`}
                    role="separator"
                    className="my-1 border-t border-apple-divider-soft"
                  />
                );
              }

              const { label, icon: Icon, onClick, danger, warning, disabled: itemDisabled, description, badge } = item;

              return (
                <button
                  key={item.key ?? label}
                  type="button"
                  role="menuitem"
                  disabled={itemDisabled}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-caption outline-none transition-colors",
                    "focus-visible:bg-apple-canvas-parchment dark:focus-visible:bg-apple-surface-tile-3",
                    itemDisabled && "cursor-not-allowed opacity-40",
                    !itemDisabled && danger && "text-red-600 hover:bg-red-50 focus-visible:bg-red-50 dark:hover:bg-red-950/20",
                    !itemDisabled && warning && "text-amber-700 hover:bg-amber-50 focus-visible:bg-amber-50 dark:hover:bg-amber-950/20",
                    !itemDisabled && !danger && !warning && "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment dark:text-apple-body-muted dark:hover:bg-apple-surface-tile-3"
                  )}
                >
                  {Icon && (
                    <Icon className={cn(
                      "h-4 w-4 shrink-0",
                      danger  ? "text-red-500"   : "",
                      warning ? "text-amber-600" : "",
                      !danger && !warning ? "text-apple-ink-muted-48" : ""
                    )} />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{label}</span>
                    {description && (
                      <span className="mt-0.5 block truncate text-fine-print font-normal leading-tight text-apple-ink-muted-48">
                        {description}
                      </span>
                    )}
                  </span>
                  {badge && (
                    <span className="ml-2 shrink-0 rounded-pill bg-apple-canvas-parchment px-1.5 py-0.5 text-fine-print font-semibold text-apple-ink-muted-48">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FloatingFocusManager>,
        document.body
      )}
    </>
  );
}
