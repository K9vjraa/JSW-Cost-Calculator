import type { LucideIcon } from "lucide-react";

export interface GradeMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  colorTheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  isLoading?: boolean;
}

import { motion } from "framer-motion";

export function GradeMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'blue',
  isLoading = false
}: GradeMetricCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-success-bg text-success-fg border-success-border',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const iconClasses = colors[colorTheme] || colors.blue;

  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-sm hover:border-[#0b5cbf] hover:shadow-[0_4px_12px_rgba(11,92,191,0.08)] transition-all duration-300"
    >
      <div className={`shrink-0 flex items-center justify-center size-[52px] rounded-sm border ${iconClasses} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="size-6 stroke-[1.5]" />
      </div>
      <div className="flex flex-col overflow-hidden w-full">
        <span className="text-xs font-semibold text-slate-500 mb-0.5 truncate">{title}</span>
        {isLoading ? (
          <>
            <div className="h-7 bg-slate-200 rounded w-16 mb-1 animate-pulse" />
            <div className="h-3.5 bg-slate-100 rounded w-24 animate-pulse" />
          </>
        ) : (
          <>
            <span className="text-2xl font-black text-slate-900 leading-tight mb-0.5 truncate">{value}</span>
            {trend ? (
              <span className="text-[11px] font-bold text-success-fg truncate">{trend}</span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400 truncate">{subtitle}</span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
