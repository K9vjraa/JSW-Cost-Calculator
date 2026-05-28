import * as React from "react";
import { cn } from "../utils";

/**
 * Curated chart color presets matching JSW's industrial SaaS styling.
 * Use these constants directly in ChartJS datasets.
 */
export const CHART_COLORS = {
  primary: "#0057b8",      // Primary JSW Cost
  accent: "#0b63c8",       // Highlighted item
  corporate: "#032f67",    // Deep blue baseline
  secondary: "#94a3b8",    // Mid-slate helper
  success: "#087443",      // Standard compositions
  danger: "#d63031",       // Surcharges
  warning: "#f2994a",      // Alerts
  lavender: "#8b5cf6",     // Alloy accent
  teal: "#14b8a6",         // Raw materials
  gray: "#cbd5e1"          // Background grids
} as const;

export const CHART_PALETTES = {
  jswTheme: [
    CHART_COLORS.primary,
    CHART_COLORS.lavender,
    CHART_COLORS.teal,
    CHART_COLORS.warning,
    CHART_COLORS.success,
    CHART_COLORS.danger,
    CHART_COLORS.secondary
  ],
  statusTheme: [
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.danger
  ]
} as const;

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  action?: React.ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  isLoading = false,
  action,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("rounded-2xl border border-[#d6dfeb] bg-white p-5 flex flex-col gap-4 relative", className)}
      {...props}
    >
      {/* Chart Headers */}
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex flex-col gap-0.5 text-left">
            {title && (
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#10233d] m-0">
                {title}
              </h4>
            )}
            {subtitle && (
              <span className="text-[10px] text-[#56657a] font-medium m-0">
                {subtitle}
              </span>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Main Chart content area with skeleton loader */}
      <div className="flex-1 relative flex items-center justify-center min-h-[200px] w-full">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-3 z-10">
            {/* Spinning indicator */}
            <svg
              className="h-7 w-7 animate-spin text-[#0057b8]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-[10px] uppercase font-bold text-[#56657a] tracking-wider animate-pulse">
              Compiling cost metrics...
            </span>
          </div>
        ) : null}

        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
export default ChartContainer;
