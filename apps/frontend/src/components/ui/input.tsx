import * as React from "react";
import { cn } from "@/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-10 w-full rounded-[7px] border bg-white px-3 text-sm text-[var(--foreground)] shadow-sm outline-none placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)]", className)} {...props} />;
});
