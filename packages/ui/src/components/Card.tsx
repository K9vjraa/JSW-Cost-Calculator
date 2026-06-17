import * as React from "react";
import { cn } from "../utils";

/* ----------------------------------------------------
   STANDARD CARD WRAPPERS
   ---------------------------------------------------- */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-md border border-[#e5e7eb] bg-white text-[#111827] overflow-hidden", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 p-4 border-b border-[#e5e7eb]", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xs font-semibold uppercase tracking-wider text-[#111827] m-0", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-[#6b7280] font-normal m-0", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-4", className)} {...props} />
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between p-3.5 bg-slate-50/50 border-t border-[#e5e7eb]", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

/* ----------------------------------------------------
   KPI METRICS CARD
   ---------------------------------------------------- */
export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  isLocked?: boolean;
}

export function KPICard({ title, value, trend, icon, isLocked, className, ...props }: KPICardProps) {
  return (
    <Card className={cn("relative p-4 flex flex-col justify-between hover:border-slate-400 transition-colors", className)} {...props}>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-[#6b7280]">{title}</span>
        {icon && <div className="text-slate-400 flex items-center justify-center size-5">{icon}</div>}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-semibold text-[#111827] tracking-tight">{value}</span>
        
        {(trend || isLocked) && (
          <div className="flex items-center justify-between text-[10px] font-semibold mt-1.5 border-t border-slate-100 pt-1.5">
            {trend ? (
              <span className={cn("flex items-center gap-0.5", trend.isPositive ? "text-[#16a34a]" : "text-[#dc2626]")}>
                {trend.isPositive ? "▲" : "▼"} {trend.value}
                {trend.label && <span className="text-slate-400 font-normal ml-1">({trend.label})</span>}
              </span>
            ) : (
              <span />
            )}
            
            {isLocked && (
              <span className="flex items-center gap-0.5 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-[8px] border border-slate-200">
                🔒 Locked
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ----------------------------------------------------
   ALERT BANNER CARD
   ---------------------------------------------------- */
export interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AlertCard({ variant = "info", title, description, action, className, ...props }: AlertCardProps) {
  const styles = {
    info: {
      card: "border-slate-200 bg-slate-50 text-slate-700",
    },
    success: {
      card: "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]",
    },
    warning: {
      card: "border-[#fdd9b5] bg-[#fef5ec] text-[#d97706]",
    },
    error: {
      card: "border-[#ffdad6] bg-[#ffdad6] text-[#ba1a1a]",
    }
  }[variant];

  return (
    <div
      className={cn(
        "rounded-md border p-4 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left",
        styles.card,
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5 max-w-xl">
        <strong className="text-xs uppercase font-semibold tracking-wider">{title}</strong>
        <p className="text-[11px] font-normal opacity-90 leading-relaxed">{description}</p>
      </div>

      {action && <div className="flex items-center shrink-0 pr-1">{action}</div>}
    </div>
  );
}
