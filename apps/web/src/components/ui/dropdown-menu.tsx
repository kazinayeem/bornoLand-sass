"use client";

/**
 * DropdownMenu — portal-based, collision-aware, keyboard-navigable.
 *
 * Renders into document.body via FloatingPortal so it is NEVER clipped
 * by overflow:hidden parents, scroll containers, or stacking contexts.
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useInteractions,
  useMergeRefs,
  FloatingFocusManager,
  FloatingPortal,
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
      description?: string;
      badge?: string;
    };

type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: Placement;
  className?: string;
  minWidth?: number;
  disabled?: boolean;
  triggerClassName?: string;
};

export function DropdownMenu({
  trigger,
  items,
  placement = "bottom-end",
  className,
  minWidth = 192,
  disabled = false,
  triggerClassName,
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

  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
    ancestorScroll: false,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  }, [disabled]);

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

  const child = Children.only(isValidElement(trigger) ? trigger : null);
  const childRef = child && "ref" in child ? (child as ReactElement & { ref?: React.Ref<HTMLElement> }).ref : null;
  const mergedRef = useMergeRefs([refs.setReference, childRef].filter(Boolean) as React.Ref<HTMLElement>[]);

  const referenceProps = getReferenceProps({
    onClick: handleTriggerClick,
    onPointerDown: (e: React.PointerEvent) => {
      // Keep card drag / row click from stealing the gesture
      e.stopPropagation();
    },
  });

  const triggerNode = child ? (
    cloneElement(child as ReactElement<Record<string, unknown>>, {
      ...referenceProps,
      ref: mergedRef,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "aria-controls": open ? menuId : undefined,
      className: cn(
        (child.props as { className?: string }).className,
        triggerClassName,
        "relative z-30 shrink-0",
      ),
      onClick: (e: React.MouseEvent) => {
        handleTriggerClick(e);
        const original = (child.props as { onClick?: (ev: React.MouseEvent) => void }).onClick;
        original?.(e);
      },
    })
  ) : (
    <button
      type="button"
      ref={refs.setReference}
      className={cn("relative z-30 inline-flex shrink-0", triggerClassName)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      {...referenceProps}
    >
      {trigger}
    </button>
  );

  return (
    <>
      {triggerNode}

      {open ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            <div
              ref={refs.setFloating}
              id={menuId}
              {...getFloatingProps({
                onKeyDown: handleKeyDown,
              })}
              style={{ ...floatingStyles, minWidth, zIndex: 10000 }}
              className={cn(
                "rounded-lg border border-apple-hairline bg-apple-canvas py-1.5 shadow-lg outline-none dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2",
                className
              )}
              role="menu"
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

                const { label, icon: Icon, danger, warning, disabled: itemDisabled, description, badge } = item;

                return (
                  <button
                    key={item.key ?? label}
                    type="button"
                    role="menuitem"
                    disabled={itemDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
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
                    <span className="min-w-0 flex-1">
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
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}
