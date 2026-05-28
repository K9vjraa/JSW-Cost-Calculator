import * as React from "react";
import { cn } from "../utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "kpi" | "card";
}

export function Skeleton({ variant = "rectangular", className, ...props }: SkeletonProps) {
  if (variant === "text") {
    return (
      <div
        className={cn("h-3 w-full rounded bg-slate-200 animate-pulse", className)}
        {...props}
      />
    );
  }

  if (variant === "circular") {
    return (
      <div
        className={cn("rounded-full bg-slate-200 animate-pulse size-10", className)}
        {...props}
      />
    );
  }

  if (variant === "kpi") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#d6dfeb] bg-white p-5 flex flex-col justify-between gap-3 animate-pulse min-h-[110px]",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="size-8 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-7 bg-slate-200 rounded w-1/2" />
          <div className="h-2.5 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#d6dfeb] bg-white p-5 flex flex-col gap-4 animate-pulse",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="size-8 bg-slate-200 rounded-lg" />
          <div className="flex flex-col gap-2 w-1/3">
            <div className="h-3 bg-slate-200 rounded" />
            <div className="h-2 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Rectangular basic block
  return (
    <div
      className={cn("rounded-lg bg-slate-200 animate-pulse h-10 w-full", className)}
      {...props}
    />
  );
}

// Layout loader utilities
export function SkeletonForm({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 w-full", className)}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-1.5 text-left">
          <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse mb-1" />
          <Skeleton className="h-9.5" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white animate-pulse">
          <div className="flex items-center gap-3 w-1/2">
            <div className="size-8 rounded bg-slate-200 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
