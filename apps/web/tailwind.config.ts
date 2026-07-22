import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "SF Pro Display",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        body: [
          "SF Pro Text",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      colors: {
        apple: {
          primary: "#0066cc",
          "primary-focus": "#0071e3",
          "primary-on-dark": "#2997ff",
          ink: "#1d1d1f",
          body: "#1d1d1f",
          "body-on-dark": "#ffffff",
          "body-muted": "#cccccc",
          "ink-muted-80": "#333333",
          "ink-muted-48": "#7a7a7a",
          "divider-soft": "#f0f0f0",
          hairline: "#e0e0e0",
          canvas: "#ffffff",
          "canvas-parchment": "#f5f5f7",
          "surface-pearl": "#fafafc",
          "surface-tile-1": "#272729",
          "surface-tile-2": "#2a2a2c",
          "surface-tile-3": "#252527",
          "surface-black": "#000000",
          "surface-chip": "#d2d2d7",
          "on-primary": "#ffffff",
          "on-dark": "#ffffff",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
          hover: "var(--color-destructive-hover)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          foreground: "var(--color-success-foreground)",
          hover: "var(--color-success-hover)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
      },
      borderRadius: {
        pill: "9999px",
        apple: {
          none: "0px",
          xs: "5px",
          sm: "8px",
          md: "11px",
          lg: "18px",
          pill: "9999px",
          full: "9999px",
        },
      },
      spacing: {
        "apple-xxs": "4px",
        "apple-xs": "8px",
        "apple-sm": "12px",
        "apple-md": "17px",
        "apple-lg": "24px",
        "apple-xl": "32px",
        "apple-xxl": "48px",
        "apple-section": "80px",
      },
      boxShadow: {
        product: "3px 5px 30px 0 rgba(0, 0, 0, 0.22)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};

export default config;
