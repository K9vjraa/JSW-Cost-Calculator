/**
 * MCMS Design Tokens
 * 
 * Programmatic values representing the official JSW Metal Cost Management System design language.
 * These tokens ensure unified typography, spacing, rounding, and color palettes across dashboard widgets,
 * workspace panels, ledgers, and modals.
 */

export const COLORS = {
  jsw: {
    corporate: "#032f67", // JSW deep corporate navy
    blue: "#0057b8",      // JSW primary bright blue
    accent: "#0b63c8",    // Accent active blue
    lightBg: "#e8f0fb",   // Secondary highlighted background
    textDark: "#063d83",  // Contrast text dark blue
  },
  neutral: {
    background: "#f5f8fc", // Sleek gray light background
    foreground: "#10233d", // Deep slate for high-density readable text
    card: "#ffffff",       // Clean white container bg
    muted: "#eef3f8",      // Subdued background tint
    mutedText: "#56657a",  // Mid-gray body text
    border: "#d6dfeb",     // Soft gray border line
  },
  status: {
    success: "#087443",    // JSW production certified green
    successBg: "#e8fbf0",  // Success background glow
    successBorder: "#bde4cf",
    danger: "#d63031",     // JSW cost surcharge/alert red
    dangerBg: "#fdf0f0",   // Alert background glow
    dangerBorder: "#f9cccc",
    warning: "#f2994a",    // High-heat furnace orange warning
    warningBg: "#fef5ec",  // Warning background glow
    warningBorder: "#fdd9b5",
    info: "#0057b8",       // Information blue
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
  sm: "4px",
  md: "8px",   // Primary card & controls rounding
  lg: "12px",  // High-fidelity card rounding
  xl: "16px",  // Large modal / header roundness
  full: "9999px"
} as const;
