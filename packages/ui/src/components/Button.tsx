import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.96] duration-200 ease-in-out",
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
        sm: "h-8 px-3 text-[11px]",
        md: "h-9.5 px-4",
        lg: "h-11 px-6 text-sm"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-3.5 w-3.5 animate-spin text-current"
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
        )}
        {!isLoading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
