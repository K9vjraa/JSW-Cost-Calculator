import * as React from "react";
import { cn } from "../utils";
import { Inbox, FileQuestion, Layers, SearchX } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  iconType?: "inbox" | "file" | "layers" | "search";
  customIcon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  iconType = "inbox",
  customIcon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const getIcon = () => {
    if (customIcon) return customIcon;

    switch (iconType) {
      case "search":
        return <SearchX className="size-8 text-[#56657a]" />;
      case "file":
        return <FileQuestion className="size-8 text-[#56657a]" />;
      case "layers":
        return <Layers className="size-8 text-[#56657a]" />;
      default:
        return <Inbox className="size-8 text-[#56657a]" />;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#d6dfeb] bg-slate-50/30 p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto gap-4 select-none",
        className
      )}
      {...props}
    >
      {/* Icon frame */}
      <div className="flex items-center justify-center size-14 bg-white border border-[#d6dfeb]/60 rounded-2xl shadow-xs">
        {getIcon()}
      </div>

      {/* Description headings */}
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#10233d] m-0">
          {title}
        </h4>
        <p className="text-[11px] text-[#56657a] font-medium leading-relaxed m-0">
          {description}
        </p>
      </div>

      {/* Action button CTA container */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
