import { IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { inr, shortDate } from '@/utils';

interface CurrentRateCardProps {
  rate: number | null | undefined;
  unit?: string;
  isActive?: boolean;
  effectiveDate?: string | Date | null;
  updatedAt?: string | Date | null;
  updatedBy?: string;
  className?: string;
}

export function CurrentRateCard({
  rate,
  unit = 'kg',
  isActive = true,
  effectiveDate,
  updatedAt,
  updatedBy,
  className = "",
}: CurrentRateCardProps) {
  const displayDate = effectiveDate 
    ? shortDate(effectiveDate) 
    : updatedAt 
      ? shortDate(updatedAt) 
      : "N/A";
  
  return (
    <div className={`bg-linear-to-br from-[#002652] to-[#0b5cbf] rounded-sm p-6 shadow-sm relative overflow-hidden text-white w-full ${className}`}>
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
        <IndianRupee className="size-32" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="block text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1.5">
              Current Active Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-black tracking-tight shadow-sm">
                {rate ? inr(rate) : "N/A"}
              </span>
              <span className="text-sm font-bold text-blue-200 uppercase">/ {unit}</span>
            </div>
          </div>
          <Badge 
            className={isActive 
              ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-3 py-1 font-bold tracking-widest shadow-none hover:bg-emerald-500/30" 
              : "bg-slate-500/20 text-slate-200 border-slate-400/30 px-3 py-1 font-bold tracking-widest shadow-none hover:bg-slate-500/30"}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Effective Since
            </span>
            <span className="block text-xs font-bold text-white">
              {displayDate}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Last Authorized By
            </span>
            <span className="block text-xs font-bold text-white truncate">
              {updatedBy || "System Automated"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
