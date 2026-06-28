import * as React from "react";
import { cn } from "@/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-10 w-full rounded-sm border bg-white px-3 text-sm text-(--foreground) shadow-sm outline-none placeholder:text-(--muted-foreground) focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 focus:ring-offset-1", className)} {...props} />;
});
