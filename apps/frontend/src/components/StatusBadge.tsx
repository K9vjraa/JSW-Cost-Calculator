import * as React from "react";
import { Badge } from "@jsw-mcms/ui";
import { FileEdit, Cloud, Loader2, CheckCircle, AlertTriangle, XCircle, Send, ShieldCheck, Calculator } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export type CostStatus = 
  | "Draft" 
  | "Saved" 
  | "Calculating" 
  | "Success" 
  | "Warning" 
  | "Failed" 
  | "Submitted"
  | "Valid"
  | "Balanced"
  | "Missing Price"
  | "Ready to Calculate";

interface StatusBadgeProps {
  status: CostStatus;
  className?: string;
  tooltipText?: string;
}

const statusConfig: Record<
  CostStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: "draft" | "success" | "info" | "warning" | "danger" | "primary" | "default";
    defaultTooltip: string;
    label: string;
    iconClass?: string;
  }
> = {
  Draft: {
    icon: FileEdit,
    variant: "draft",
    defaultTooltip: "This sheet contains unsubmitted draft configuration.",
    label: "Draft",
  },
  Saved: {
    icon: Cloud,
    variant: "success",
    defaultTooltip: "All changes are saved to browser or server database.",
    label: "Saved",
  },
  Calculating: {
    icon: Loader2,
    variant: "info",
    defaultTooltip: "Running cost simulations based on inputs...",
    label: "Calculating",
    iconClass: "animate-spin",
  },
  Success: {
    icon: CheckCircle,
    variant: "success",
    defaultTooltip: "Calculation run compiled successfully with zero errors.",
    label: "Success",
  },
  Warning: {
    icon: AlertTriangle,
    variant: "warning",
    defaultTooltip: "Cost validation warnings: check material compositions.",
    label: "Warning",
  },
  Failed: {
    icon: XCircle,
    variant: "danger",
    defaultTooltip: "Calculation run failed to compile due to invalid specifications.",
    label: "Failed",
  },
  Submitted: {
    icon: Send,
    variant: "primary",
    defaultTooltip: "Calculation finalized and submitted to active workflows.",
    label: "Submitted",
  },
  Valid: {
    icon: CheckCircle,
    variant: "success",
    defaultTooltip: "This sheet's configuration meets all validation constraints.",
    label: "Valid",
  },
  Balanced: {
    icon: ShieldCheck,
    variant: "success",
    defaultTooltip: "All raw material compositions in the sheet total exactly 100%.",
    label: "Balanced",
  },
  "Missing Price": {
    icon: AlertTriangle,
    variant: "danger",
    defaultTooltip: "One or more raw material ingredients are missing prices in the master catalog.",
    label: "Price Missing",
  },
  "Ready to Calculate": {
    icon: Calculator,
    variant: "primary",
    defaultTooltip: "The sheet is validated and ready for cost calculation run.",
    label: "Ready to Calc",
  },
};

export function StatusBadge({ status, className, tooltipText }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help" role="status" aria-label={`Status: ${config.label}. ${tooltipText || config.defaultTooltip}`}>
            <Badge
              variant={config.variant}
              icon={<IconComponent className={config.iconClass || "size-3.5"} />}
              className={className}
            >
              {config.label}
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-xs">
          {tooltipText || config.defaultTooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
