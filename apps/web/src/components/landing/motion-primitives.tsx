"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Hook to detect prefers-reduced-motion
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook to detect when element is intersecting viewport
 */
export function useInView(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/**
 * <Reveal> - Smooth scroll-triggered reveal component with hardware-accelerated CSS transforms
 */
interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number;
}

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 550,
  threshold = 0.12,
}: RevealProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { ref, inView } = useInView({
    threshold,
    rootMargin: "0px 0px -40px 0px",
  });

  const getTransform = () => {
    if (prefersReduced || inView) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return "translate3d(0, 24px, 0)";
      case "down":
        return "translate3d(0, -24px, 0)";
      case "left":
        return "translate3d(28px, 0, 0)";
      case "right":
        return "translate3d(-28px, 0, 0)";
      case "scale":
        return "scale(0.96)";
      case "fade":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={ref}
      className={cn("will-change-[transform,opacity]", className)}
      style={{
        opacity: prefersReduced ? 1 : inView ? 1 : 0,
        transform: getTransform(),
        transitionProperty: prefersReduced
          ? "none"
          : "opacity, transform",
        transitionDuration: prefersReduced ? "0ms" : `${duration}ms`,
        transitionDelay: prefersReduced ? "0ms" : `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * <AnimatedNumber> - Counts up smoothly to target value when in viewport
 */
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number; // ms
  locale?: string;
  className?: string;
}

export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1200,
  locale = "en-US",
  className,
}: AnimatedNumberProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    if (!inView) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = easedProgress * value;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, value, duration, prefersReduced]);

  const formatted = displayValue.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
});

/**
 * <AnimatedChart> - High-performance SVG line/area chart that draws itself dynamically on scroll
 */
interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AnimatedChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  fillOpacity?: number;
  showPoints?: boolean;
  showGrid?: boolean;
  valuePrefix?: string;
  className?: string;
}

export function AnimatedChart({
  data,
  height = 140,
  color = "#003399",
  fillOpacity = 0.14,
  showPoints = true,
  showGrid = true,
  valuePrefix = "৳",
  className,
}: AnimatedChartProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const width = 500;
  const paddingX = 24;
  const paddingY = 20;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((d.value - minVal) / range) * usableHeight;
    return { x, y, ...d };
  });

  // SVG path definition
  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    // Smooth bezier curve
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div ref={ref} className={cn("relative w-full select-none", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          <clipPath id="chartRevealClip">
            <rect
              x="0"
              y="0"
              width={prefersReduced || inView ? width : 0}
              height={height}
              style={{
                transition: prefersReduced ? "none" : "width 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="stroke-zinc-200/60" strokeDasharray="3 3">
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} />
            <line
              x1={paddingX}
              y1={paddingY + usableHeight / 2}
              x2={width - paddingX}
              y2={paddingY + usableHeight / 2}
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
            />
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaD}
          fill="url(#chartAreaGrad)"
          clipPath="url(#chartRevealClip)"
        />

        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#chartRevealClip)"
        />

        {/* Data points */}
        {showPoints &&
          points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hit target area */}
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                {/* Visual circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill="#FFFFFF"
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{
                    opacity: prefersReduced || inView ? 1 : 0,
                    transition: "opacity 300ms ease, r 200ms ease, stroke-width 200ms ease",
                    transitionDelay: prefersReduced ? "0ms" : `${idx * 60 + 300}ms`,
                  }}
                />
              </g>
            );
          })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-md bg-zinc-950 text-white text-[11px] font-semibold shadow-lg transition-all duration-150 border border-zinc-800"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 8}%`,
          }}
        >
          <div className="text-[9px] text-zinc-400 font-normal uppercase tracking-wider">
            {points[hoveredIndex].label}
          </div>
          <div className="font-bold text-[#FFDA1A]">
            {valuePrefix}
            {points[hoveredIndex].value.toLocaleString()}
          </div>
        </div>
      )}

      {/* Bottom X-Axis Labels */}
      <div className="flex justify-between items-center px-4 pt-2 text-[10px] font-medium text-zinc-400">
        {data.map((d, i) => (
          <span
            key={i}
            className={cn(
              "transition-colors duration-200",
              hoveredIndex === i ? "text-zinc-950 font-bold" : ""
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * <Stagger> & <StaggerItem> - Container that animates child items sequentially
 */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("stagger-container", className)}>
      {children}
    </div>
  );
}

/**
 * <SystemFlowDiagram> - Animated interactive system pulse connector
 */
interface SystemNode {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
  badge?: string;
  color?: string;
}

export function SystemFlowDiagram({
  nodes,
  activeId,
  onSelect,
  className,
}: {
  nodes: SystemNode[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-between gap-2 overflow-x-auto py-4 px-2", className)}>
      {/* Background connector line */}
      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-200 via-zinc-200 to-emerald-200 -z-10" />

      {nodes.map((node, i) => {
        const isActive = activeId === node.id;
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect?.(node.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-all duration-200 text-left min-w-[130px] group shadow-xs cursor-pointer",
              isActive
                ? "border-[#003399] shadow-md ring-2 ring-[#003399]/15 -translate-y-1"
                : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                  isActive ? "bg-[#003399] text-white" : "bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200"
                )}
              >
                0{i + 1}
              </span>
              {node.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {node.badge}
                </span>
              )}
            </div>
            <div className="w-full">
              <p className={cn("text-xs font-bold", isActive ? "text-[#003399]" : "text-zinc-900")}>
                {node.title}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{node.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
