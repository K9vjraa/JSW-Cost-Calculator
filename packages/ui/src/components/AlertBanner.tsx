import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title: string;
  description: string;
  isDismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

export function AlertBanner({
  variant = "info",
  title,
  description,
  isDismissible = true,
  onDismiss,
  action,
  className,
  ...props
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const styles = {
    info: {
      card: "border-[#bfd6f5] bg-[#edf5ff] text-[#063d83]",
      bullet: "bg-[#0057b8]",
      icon: <Info className="size-4 shrink-0 text-[#0057b8]" />
    },
    success: {
      card: "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]",
      bullet: "bg-[#087443]",
      icon: <CheckCircle2 className="size-4 shrink-0 text-[#087443]" />
    },
    warning: {
      card: "border-[#fdd9b5] bg-[#fef5ec] text-[#f2994a]",
      bullet: "bg-[#f2994a]",
      icon: <AlertTriangle className="size-4 shrink-0 text-[#f2994a]" />
    },
    danger: {
      card: "border-[#f9cccc] bg-[#fdf0f0] text-[#d63031]",
      bullet: "bg-[#d63031]",
      icon: <AlertCircle className="size-4 shrink-0 text-[#d63031]" />
    }
  }[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={cn("w-full", className)} {...props}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
            className={cn(
              "rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left w-full",
              styles.card
            )}
          >
            {/* Decorative left brand band */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.bullet)} />

            <div className="flex items-start gap-2.5 pl-2 max-w-2xl">
              <span className="mt-0.5">{styles.icon}</span>
              <div className="flex flex-col gap-0.5">
                <strong className="text-xs uppercase font-extrabold tracking-wider">{title}</strong>
                <p className="text-[11px] font-semibold opacity-90 leading-relaxed m-0">{description}</p>
              </div>
            </div>

            <div className="flex items-center shrink-0 gap-3 ml-auto sm:ml-0">
              {action && <div className="flex items-center shrink-0">{action}</div>}
              
              {isDismissible && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[#56657a] hover:bg-black/5 hover:text-[#10233d] p-1 rounded-full cursor-pointer transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default AlertBanner;
