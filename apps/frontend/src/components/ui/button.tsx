import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.96] duration-200 ease-in-out",
  {
    variants: {
      variant: {
        primary: "bg-[#1A365D] text-white hover:bg-[#122543] border border-[#1A365D] shadow-sm",
        default: "bg-[#1A365D] text-white hover:bg-[#122543] border border-[#1A365D] shadow-sm",
        secondary: "bg-[#f8fafc] text-[#1A365D] border border-slate-200 hover:bg-[#f1f5f9] shadow-sm",
        outline: "border border-[#d6dfeb] bg-white text-[#10233d] hover:bg-[#f5f8fc]",
        ghost: "text-slate-600 bg-transparent border-transparent hover:bg-slate-50 hover:text-slate-800 shadow-none",
        danger: "bg-[#d63031] text-white hover:bg-[#b52627] border border-[#d63031] shadow-sm",
        success: "bg-[#087443] text-white hover:bg-[#065c34] border border-[#087443] shadow-sm"
      },
      size: {
        default: "h-9.5 px-4",
        sm: "h-8 px-3 text-[11px]",
        md: "h-9.5 px-4",
        lg: "h-11 px-6 text-sm",
        icon: "size-10 px-0"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild, className, variant, size, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
