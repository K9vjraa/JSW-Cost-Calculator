import { shortDate } from "../utils";
import { inr } from "@jsw-mcms/ui";
import { TrendingUp, TrendingDown, Clock, User, FileText, ArrowRight } from "lucide-react";

interface PriceHistoryEntry {
  id: string;
  reason?: string;
  oldPrice?: number;
  newPrice: number;
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: { name: string };
  remarks?: string;
}

interface PriceActivityTimelineProps {
  history: PriceHistoryEntry[];
  materialName?: string;
  materialCode?: string;
}

export function PriceActivityTimeline({ history, materialName, materialCode }: PriceActivityTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-dashed border-slate-200 rounded-sm bg-slate-50/50 opacity-80">
        <Clock className="size-8 text-slate-300 mb-3" />
        <span className="block text-xs font-bold text-slate-500">No Activity Found</span>
        <span className="block text-[10px] text-slate-400 mt-1 text-center max-w-[250px]">
          There are no recorded price adjustments or historical events for this material.
        </span>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 pb-4 pt-2 space-y-8">
      {history.map((hist, index) => {
        const isIncrease = hist.oldPrice && hist.newPrice > hist.oldPrice;
        const isDecrease = hist.oldPrice && hist.newPrice < hist.oldPrice;
        const isInitial = !hist.oldPrice;
        
        const timestamp = hist.effectiveDate || hist.createdAt || hist.updatedAt;

        return (
          <div key={hist.id || index} className="relative group">
            {/* Timeline Connector Dot */}
            <div className={`absolute -left-[31px] top-1.5 size-4 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${
              isIncrease ? "bg-rose-500" :
              isDecrease ? "bg-emerald-500" :
              "bg-[#0b5cbf]"
            }`}></div>

            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:shadow-sm transition-shadow">
              {/* Header: Event Type & Timestamp */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-sm ${
                    isIncrease ? "bg-rose-50 text-rose-600" :
                    isDecrease ? "bg-emerald-50 text-emerald-600" :
                    "bg-blue-50 text-[#0b5cbf]"
                  }`}>
                    {isDecrease ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      {hist.reason || (isInitial ? "Initial Price Set" : "Price Adjustment")}
                    </h5>
                    {(materialName || materialCode) && (
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                        {materialCode && <span className="text-[#0b5cbf]">{materialCode}</span>}
                        {materialCode && materialName && " - "}
                        {materialName}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-100">
                  <Clock className="size-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">
                    {timestamp ? shortDate(timestamp) : "Unknown Date"}
                  </span>
                </div>
              </div>

              {/* Body: Financial Changes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div className="bg-slate-50 rounded-sm p-3 border border-slate-100">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Previous Rate</span>
                  <span className="text-sm font-mono font-semibold text-slate-500 line-through decoration-slate-300">
                    {hist.oldPrice ? inr(hist.oldPrice) : "-"}
                  </span>
                </div>
                
                <div className="hidden sm:flex items-center justify-center">
                  <ArrowRight className={`size-5 ${
                    isIncrease ? "text-rose-300" :
                    isDecrease ? "text-emerald-300" :
                    "text-blue-300"
                  }`} />
                </div>
                
                <div className={`rounded-sm p-3 border ${
                  isIncrease ? "bg-rose-50 border-rose-100" :
                  isDecrease ? "bg-emerald-50 border-emerald-100" :
                  "bg-blue-50 border-blue-100"
                }`}>
                  <span className={`block text-[9px] uppercase font-bold mb-1 ${
                    isIncrease ? "text-rose-500" :
                    isDecrease ? "text-emerald-500" :
                    "text-[#0b5cbf]"
                  }`}>New Rate</span>
                  <span className={`text-sm font-mono font-black ${
                    isIncrease ? "text-rose-700" :
                    isDecrease ? "text-emerald-700" :
                    "text-[#0b5cbf]"
                  }`}>
                    {inr(hist.newPrice)}
                  </span>
                </div>
              </div>

              {/* Footer: User & Remarks */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-sm border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-slate-400" />
                  <span>Authorized by: <strong className="text-slate-700">{hist.updatedBy?.name || "System Automated"}</strong></span>
                </div>
                {hist.remarks && (
                  <>
                    <div className="w-px h-3 bg-slate-300 hidden sm:block"></div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]" title={hist.remarks}>Note: {hist.remarks}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
