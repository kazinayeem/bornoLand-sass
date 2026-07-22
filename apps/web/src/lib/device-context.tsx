"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Breakpoint } from "./builder-types";
import { BREAKPOINT_WIDTHS } from "./builder-types";

type DeviceContextValue = {
  device: Breakpoint;
  isBuilder: boolean;
};

const DeviceContext = createContext<DeviceContextValue>({
  device: "desktop",
  isBuilder: false,
});

export function useDevice(): Breakpoint {
  return useContext(DeviceContext).device;
}

export function useIsBuilder(): boolean {
  return useContext(DeviceContext).isBuilder;
}

/**
 * Wraps the builder preview with a fixed device from Redux.
 */
export function BuilderDeviceProvider({
  device,
  children,
}: {
  device: Breakpoint;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ device, isBuilder: true }), [device]);
  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

/**
 * Wraps the live storefront with auto-detected device from viewport width.
 */
export function StorefrontDeviceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [device, setDevice] = useState<Breakpoint>("desktop");

  function detectBreakpoint(width: number): Breakpoint {
    if (width <= BREAKPOINT_WIDTHS.mobile) return "mobile";
    if (width <= BREAKPOINT_WIDTHS.tablet) return "tablet";
    if (width <= BREAKPOINT_WIDTHS.laptop) return "laptop";
    return "desktop";
  }

  useEffect(() => {
    let frame = 0;
    function detectDevice() {
      frame = 0;
      const detected = detectBreakpoint(window.innerWidth);
      setDevice((current) => current === detected ? current : detected);
    }

    detectDevice();
    const onResize = () => {
      if (!frame) frame = window.requestAnimationFrame(detectDevice);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => { window.removeEventListener("resize", onResize); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const value = useMemo(() => ({ device, isBuilder: false }), [device]);

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}
