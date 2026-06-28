import * as React from "react";
import { cn } from "../utils";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-xl border border-[#d6dfeb] bg-white shadow-xs scrollbar-thin">
      <table ref={ref} className={cn("w-full caption-bottom text-xs", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-slate-100/80 border-b border-[#d6dfeb]", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 bg-white", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t border-[#d6dfeb] bg-slate-50 font-bold", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b border-[#d6dfeb]/50 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-[#e8f0fb]", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-8 px-3 text-left align-middle font-bold text-[#56657a] uppercase tracking-wider text-[10px] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("py-1.5 px-3 align-middle text-[#10233d] font-semibold [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";
