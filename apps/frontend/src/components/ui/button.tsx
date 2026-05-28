import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm hover:bg-[#004998]",
        secondary: "border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[#dbe8fb]",
        outline: "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted)]",
        danger: "border-[#f2bbbb] bg-[#fff1f1] text-[var(--danger)] hover:bg-[#ffe5e5]",
        ghost: "border-transparent bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]"
      },
      size: {
        default: "px-4",
        sm: "h-8 px-3 text-xs",
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
