"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLoading } from "@/hooks/use-loading";

export function NavigationProgressBar() {
  const { navigationProgress, isNavigating } = useLoading();
  const reduceMotion = useReducedMotion();

  if (!isNavigating && navigationProgress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(navigationProgress)}
      aria-label="Page loading"
      aria-busy={isNavigating}
    >
      <motion.div
        className="h-full origin-left bg-apple-primary will-change-transform"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: navigationProgress / 100 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
        }
        style={{ width: "100%" }}
      />
    </div>
  );
}
