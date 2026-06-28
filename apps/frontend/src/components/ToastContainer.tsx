import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useNotificationStore, type Toast } from "@/store/notificationStore";
import { cn } from "@jsw-mcms/ui";

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useNotificationStore((state) => state.dismissToast);
  const duration = toast.duration ?? 5000;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, dismissToast]);

  const styles = {
    success: {
      card: "border-success-border bg-success-bg text-success-fg",
      icon: <CheckCircle2 className="size-4 shrink-0 text-success-fg" />
    },
    warning: {
      card: "border-warning-border bg-warning-bg text-warning-fg",
      icon: <AlertTriangle className="size-4 shrink-0 text-warning-fg" />
    },
    error: {
      card: "border-danger-border bg-[#fdf0f0] text-[#d63031]",
      icon: <AlertCircle className="size-4 shrink-0 text-[#d63031]" />
    },
    info: {
      card: "border-[#bfd6f5] bg-[#edf5ff] text-[#063d83]",
      icon: <Info className="size-4 shrink-0 text-[#0057b8]" />
    }
  }[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className={cn(
        "rounded-sm border p-4 shadow-sm flex items-start justify-between gap-3 text-left w-full pointer-events-auto bg-white",
        styles.card
      )}
    >
      <div className="flex items-start gap-2.5 max-w-[260px]">
        <span className="mt-0.5 shrink-0">{styles.icon}</span>
        <div className="flex flex-col gap-0.5">
          <strong className="text-xs uppercase font-extrabold tracking-wider leading-none">
            {toast.title}
          </strong>
          <p className="text-[10px] font-semibold opacity-90 leading-relaxed m-0">
            {toast.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="text-[#56657a] hover:bg-black/5 hover:text-[#10233d] p-0.5 rounded cursor-pointer transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useNotificationStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
export default ToastContainer;
