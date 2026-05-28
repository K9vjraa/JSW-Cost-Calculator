import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#d6dfeb] bg-[#f5f8fc] text-[#10233d]",
        primary: "border-[#bfd6f5] bg-[#edf5ff] text-[#0057b8]",
        success: "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]",
        warning: "border-[#fdd9b5] bg-[#fef5ec] text-[#f2994a]",
        danger: "border-[#f9cccc] bg-[#fdf0f0] text-[#d63031]",
        info: "border-[#bfd6f5] bg-[#edf5ff] text-[#063d83]",
        outline: "border-[#d6dfeb] bg-transparent text-[#56657a]",
        draft: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
        archived: "border-[#cbd5e1] bg-[#f1f5f9] text-[#475569]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="flex items-center justify-center size-3.5">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
