/**
 * MCMS Design Tokens
 * 
 * Programmatic values representing the official JSW Metal Cost Management System design language.
 * These tokens ensure unified typography, spacing, rounding, and color palettes across dashboard widgets,
 * workspace panels, ledgers, and modals.
 */

export const COLORS = {
  jsw: {
    corporate: "#002652", // JSW primary dark blue
    blue: "#003b7a",      // JSW primary bright blue
    accent: "#d97706",    // Accent furnace/warning orange
    lightBg: "#f9f9ff",   // Secondary highlighted background
    textDark: "#141b2b",  // Contrast text dark blue
  },
  neutral: {
    background: "#f9f9ff", // Sleek gray light background
    foreground: "#141b2b", // Deep slate for high-density readable text
    card: "#ffffff",       // Clean white container bg
    muted: "#e9edff",      // Subdued background tint (Surface Container)
    mutedText: "#434750",  // Mid-gray body text (On Surface Variant)
    border: "#c3c6d2",     // Soft gray border line (Outline Variant)
  },
  status: {
    success: "#087443",    // JSW production certified green
    successBg: "#e8fbf0",  // Success background glow
    successBorder: "#bde4cf",
    danger: "#ba1a1a",     // JSW cost surcharge/alert red
    dangerBg: "#ffdad6",   // Alert background glow
    dangerBorder: "#93000a",
    warning: "#f2994a",    // High-heat furnace orange warning
    warningBg: "#fef5ec",  // Warning background glow
    warningBorder: "#fdd9b5",
    info: "#003b7a",       // Information blue
    infoBg: "#edf5ff",
    infoBorder: "#bfd6f5"
  }
} as const;

export const SPACING = {
  grid: 4, // 4px high-density base grid
  scale: {
    xxs: "2px",
    xs: "4px",   // Density spacing (padding, text gaps)
    sm: "8px",   // Multi-element padding
    md: "12px",  // Intermediate dense layout gaps
    lg: "16px",  // Card internals padding
    xl: "20px",  // Layout grid gap
    xxl: "32px", // Outer sections spacing
  }
} as const;

export const TYPOGRAPHY = {
  family: 'Inter, "Segoe UI", Arial, sans-serif',
  scale: {
    xs: {
      fontSize: "11px",
      lineHeight: "14px",
      letterSpacing: "0.01em"
    },
    sm: {
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0"
    },
    base: {
      fontSize: "13px",
      lineHeight: "18px",
      letterSpacing: "0"
    },
    lg: {
      fontSize: "15px",
      lineHeight: "20px",
      letterSpacing: "-0.01em"
    },
    xl: {
      fontSize: "18px",
      lineHeight: "24px",
      letterSpacing: "-0.01em"
    },
    xxl: {
      fontSize: "24px",
      lineHeight: "32px",
      letterSpacing: "-0.02em"
    }
  }
} as const;

export const ROUNDNESS = {
  none: "0px",
  sm: "2px",
  md: "4px",   // Primary card & controls rounding (soft 4px)
  lg: "8px",   // High-fidelity card rounding (8px)
  xl: "12px",  // Large modal / header roundness
  full: "9999px"
} as const;
