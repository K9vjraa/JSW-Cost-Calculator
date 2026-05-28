import * as React from "react";
import { cn } from "../utils";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";

export interface FilterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  onApply?: () => void;
  onReset?: () => void;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  title?: string;
  applyLabel?: string;
  resetLabel?: string;
  showActions?: boolean;
}

export function FilterPanel({
  onApply,
  onReset,
  isCollapsible = true,
  defaultOpen = true,
  title = "Filter Parameters",
  applyLabel = "Apply Filters",
  resetLabel = "Reset Filters",
  showActions = true,
  children,
  className,
  ...props
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#d6dfeb] bg-white overflow-hidden shadow-xs text-left",
        className
      )}
      {...props}
    >
      {/* Header section with toggle and reset option */}
      <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-[#d6dfeb]/50 select-none">
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#10233d]",
            isCollapsible ? "cursor-pointer" : ""
          )}
          onClick={() => isCollapsible && setIsOpen(!isOpen)}
        >
          <Filter className="size-3.5 text-[#0057b8]" />
          <span>{title}</span>
          {isCollapsible && (
            <span className="text-[#56657a] ml-1">
              {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </span>
          )}
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#56657a] hover:text-[#d63031] transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>{resetLabel}</span>
          </button>
        )}
      </div>

      {/* Expandable filters body container */}
      {(!isCollapsible || isOpen) && (
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {children}
          </div>

          {showActions && (onApply || onReset) && (
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-1">
              {onReset && (
                <Button
                  variant="outline"
                  onClick={onReset}
                  size="sm"
                  className="h-8.5 text-[10px] font-extrabold uppercase tracking-wider"
                >
                  Clear All
                </Button>
              )}
              {onApply && (
                <Button
                  onClick={onApply}
                  size="sm"
                  className="h-8.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#0057b8] hover:bg-[#0b63c8]"
                >
                  {applyLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
