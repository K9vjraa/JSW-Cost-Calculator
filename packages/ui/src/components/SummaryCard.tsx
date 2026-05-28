import * as React from "react";
import { cn } from "../utils";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SummaryItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export interface SummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  items: SummaryItem[];
  columns?: 2 | 3 | 4;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  headerAction?: React.ReactNode;
}

export function SummaryCard({
  title,
  subtitle,
  items,
  columns = 3,
  isCollapsible = false,
  defaultOpen = true,
  headerAction,
  className,
  ...props
}: SummaryCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
  }[columns];

  return (
    <Card className={cn("text-left border-[#d6dfeb] bg-white", className)} {...props}>
      <CardHeader
        onClick={() => isCollapsible && setIsOpen(!isOpen)}
        className={cn(
          "flex-row items-center justify-between p-4 cursor-pointer select-none",
          isCollapsible ? "hover:bg-slate-50/50" : "cursor-default"
        )}
      >
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-xs uppercase font-extrabold tracking-wider text-[#10233d]">
            {title}
          </CardTitle>
          {subtitle && (
            <span className="text-[10px] text-[#56657a] font-medium">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {headerAction && <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>}
          {isCollapsible && (
            <span className="text-[#56657a]">
              {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </span>
          )}
        </div>
      </CardHeader>

      {(!isCollapsible || isOpen) && (
        <CardContent className="p-4 border-t border-[#d6dfeb]/50">
          <div className={cn("grid gap-4", gridColsClass)}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/60 transition-colors",
                  item.className
                )}
              >
                {item.icon && (
                  <div className="text-[#0057b8] flex items-center justify-center p-1.5 bg-[#edf5ff] rounded-lg size-8 shrink-0">
                    {item.icon}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#56657a]">
                    {item.label}
                  </span>
                  <span className="text-sm font-black text-[#10233d] tracking-tight leading-none">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
