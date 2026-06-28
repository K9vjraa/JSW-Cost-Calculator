import * as React from "react";
import { cn } from "@/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />;
}
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("border-b bg-[#f7faff] px-4 py-3 align-middle text-xs font-semibold uppercase tracking-wider text-slate-500", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b px-4 py-3 align-middle text-slate-700", className)} {...props} />;
}
export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors duration-150 hover:bg-slate-50 data-[state=selected]:bg-slate-50", className)} {...props} />;
}
