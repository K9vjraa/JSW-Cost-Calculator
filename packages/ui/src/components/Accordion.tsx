import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";

export interface AccordionItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
  className
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border border-[#d6dfeb] bg-white rounded-xl overflow-hidden shadow-xs mb-3", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-[#0057b8] flex items-center justify-center">{icon}</span>}
          <div className="flex flex-col gap-0.5">
            <strong className="text-xs uppercase font-extrabold tracking-wider text-[#10233d]">{title}</strong>
            {subtitle && <span className="text-[10px] text-[#56657a] font-medium">{subtitle}</span>}
          </div>
        </div>

        <span className="text-[#56657a] flex items-center justify-center">
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="h-4.5 w-4.5 stroke-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="p-4 bg-slate-50/30 border-t border-[#d6dfeb]/50 text-xs text-[#10233d] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
