import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = "right",
  className
}: DrawerProps) {
  // Lock body scrolling when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const slideVariants = {
    hidden: { x: side === "right" ? "100%" : "-100%", opacity: 0.9 },
    visible: { x: 0, opacity: 1 },
    exit: { x: side === "right" ? "100%" : "-100%", opacity: 0.9 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#10233d]/60 backdrop-blur-xs"
          />

          {/* Drawer container panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={cn(
              "relative w-full max-w-md h-full bg-white border-l border-[#d6dfeb] shadow-2xl flex flex-col z-10 text-left",
              side === "left" ? "left-0 mr-auto border-r border-l-0" : "right-0 ml-auto",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#d6dfeb]/50 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#10233d] m-0">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] text-[#56657a] font-medium m-0">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-[#56657a] hover:bg-slate-100 hover:text-[#10233d] p-1.5 rounded-full cursor-pointer transition-colors"
                aria-label="Close drawer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin text-xs text-[#10233d]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 bg-slate-50 border-t border-[#d6dfeb]/50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
