"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Breakpoint } from "./builder-types";
import { BREAKPOINT_WIDTHS, BREAKPOINT_ORDER } from "./builder-types";

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
  return (
    <DeviceContext.Provider value={{ device, isBuilder: true }}>
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

  useEffect(() => {
    function detectDevice() {
      const w = window.innerWidth;
      // Walk breakpoints from smallest to find the matching device
      let detected: Breakpoint = "desktop";
      for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
        const bp = BREAKPOINT_ORDER[i];
        if (w <= BREAKPOINT_WIDTHS[bp]) {
          detected = bp;
        }
      }
      setDevice(detected);
    }

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  return (
    <DeviceContext.Provider value={{ device, isBuilder: false }}>
      {children}
    </DeviceContext.Provider>
  );
}
