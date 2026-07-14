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
  useRef,
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
  arrow,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  FloatingFocusManager,
  type Placement,
} from "@floating-ui/react";
import { motion, AnimatePresence } from "framer-motion";
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
  const arrowRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open,
    onOpenChange: disabled ? undefined : setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackAxisSideDirection: "start", padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click   = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role    = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // Close on scroll of any ancestor (keeps position fresh while open via autoUpdate)
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  // Actionable items only (skip dividers) for keyboard navigation
  const actionItems = items.filter((i): i is Extract<DropdownItem, { label: string }> => !i.divider);

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

  const panel = (
    <AnimatePresence>
      {open && (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          <motion.div
            ref={refs.setFloating}
            id={menuId}
            style={{ ...floatingStyles, minWidth, zIndex: 9999 }}
            {...getFloatingProps({ onKeyDown: handleKeyDown })}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "rounded-xl border border-zinc-200/80 bg-white py-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/5 outline-none",
              className
            )}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key ?? `divider-${index}`}
                    role="separator"
                    className="my-1 border-t border-zinc-100"
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
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium outline-none transition-colors",
                    "focus-visible:bg-zinc-50",
                    itemDisabled && "cursor-not-allowed opacity-40",
                    !itemDisabled && danger  && "text-red-600 hover:bg-red-50 focus-visible:bg-red-50",
                    !itemDisabled && warning && "text-amber-700 hover:bg-amber-50 focus-visible:bg-amber-50",
                    !itemDisabled && !danger && !warning && "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  {Icon && (
                    <Icon className={cn(
                      "h-4 w-4 shrink-0",
                      danger  ? "text-red-500"   : "",
                      warning ? "text-amber-600" : "",
                      !danger && !warning ? "text-zinc-400" : ""
                    )} />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{label}</span>
                    {description && (
                      <span className="block truncate text-[11px] font-normal text-zinc-400 leading-tight mt-0.5">
                        {description}
                      </span>
                    )}
                  </span>
                  {badge && (
                    <span className="ml-2 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </FloatingFocusManager>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger — we clone it to attach ref + aria props */}
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {trigger}
      </div>

      {/* Portal → document.body, so never clipped by overflow:hidden */}
      {typeof document !== "undefined" && createPortal(panel, document.body)}
    </>
  );
}
