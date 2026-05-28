import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className
}: ModalProps) {
  // Lock body scrolling when modal is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#10233d]/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full max-w-lg bg-white rounded-2xl border border-[#d6dfeb] shadow-2xl overflow-hidden flex flex-col z-10 text-left",
              className
            )}
          >
            {/* Header section */}
            <div className="flex items-center justify-between p-5 border-b border-[#d6dfeb]/50">
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
                aria-label="Close modal"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content box */}
            <div className="p-5 overflow-y-auto max-h-[65vh] scrollbar-thin text-xs text-[#10233d]">
              {children}
            </div>

            {/* Footer controls */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-[#d6dfeb]/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
