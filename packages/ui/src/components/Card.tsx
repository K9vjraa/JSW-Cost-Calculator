import * as React from "react";
import { cn } from "../utils";

/* ----------------------------------------------------
   STANDARD CARD WRAPPERS
   ---------------------------------------------------- */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-[#d6dfeb] bg-white text-[#10233d] shadow-xs overflow-hidden", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 border-b border-[#d6dfeb]/50", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-bold uppercase tracking-wider text-[#10233d] m-0", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-[#56657a] font-medium m-0", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-5", className)} {...props} />
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between p-4 bg-slate-50/50 border-t border-[#d6dfeb]/50", className)} {...props} />
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
    <Card className={cn("relative p-5 flex flex-col justify-between hover:shadow-md transition-shadow", className)} {...props}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#56657a]">{title}</span>
        {icon && <div className="text-[#0057b8] flex items-center justify-center p-1.5 bg-[#edf5ff] rounded-lg size-8">{icon}</div>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-2xl font-black text-[#10233d] tracking-tight">{value}</span>
        
        {(trend || isLocked) && (
          <div className="flex items-center justify-between text-[10px] font-bold mt-1.5 border-t border-slate-100 pt-1.5">
            {trend ? (
              <span className={cn("flex items-center gap-0.5", trend.isPositive ? "text-[#087443]" : "text-[#d63031]")}>
                {trend.isPositive ? "▲" : "▼"} {trend.value}
                {trend.label && <span className="text-slate-400 font-medium ml-1">({trend.label})</span>}
              </span>
            ) : (
              <span />
            )}
            
            {isLocked && (
              <span className="flex items-center gap-0.5 text-[#063d83] bg-[#edf5ff] px-1.5 py-0.5 rounded uppercase font-extrabold text-[8px]">
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
      card: "border-[#bfd6f5] bg-[#edf5ff] text-[#063d83]",
      bullet: "bg-[#0057b8]"
    },
    success: {
      card: "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]",
      bullet: "bg-[#087443]"
    },
    warning: {
      card: "border-[#fdd9b5] bg-[#fef5ec] text-[#f2994a]",
      bullet: "bg-[#f2994a]"
    },
    error: {
      card: "border-[#f9cccc] bg-[#fdf0f0] text-[#d63031]",
      bullet: "bg-[#d63031]"
    }
  }[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left",
        styles.card,
        className
      )}
      {...props}
    >
      {/* Decorative vertical band */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.bullet)} />

      <div className="flex flex-col gap-0.5 pl-2 max-w-xl">
        <strong className="text-xs uppercase font-extrabold tracking-wider">{title}</strong>
        <p className="text-[11px] font-semibold opacity-90 leading-relaxed">{description}</p>
      </div>

      {action && <div className="flex items-center shrink-0 pr-1">{action}</div>}
    </div>
  );
}
