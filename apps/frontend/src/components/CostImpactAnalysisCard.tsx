import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Sparkles, DollarSign } from "lucide-react";
import { useMemo } from "react";

export interface CostImpactAnalysisCardProps {
  grades?: any[];
  isLoading?: boolean;
}

export function CostImpactAnalysisCard({ grades = [], isLoading = false }: CostImpactAnalysisCardProps) {
  const stats = useMemo(() => {
    if (!grades || grades.length === 0) return null;

    let highest = grades[0];
    let lowest = grades[0];
    let totalPremium = 0;

    grades.forEach(g => {
      const premium = Number(g.extraPrice || 0);
      if (premium > Number(highest.extraPrice || 0)) highest = g;
      if (premium < Number(lowest.extraPrice || 0)) lowest = g;
      totalPremium += premium;
    });

    const avgPremium = totalPremium / grades.length;
    
    const highestDiff = avgPremium > 0 ? ((Number(highest.extraPrice || 0) - avgPremium) / avgPremium) * 100 : 0;
    const lowestDiff = avgPremium > 0 ? ((avgPremium - Number(lowest.extraPrice || 0)) / avgPremium) * 100 : 0;

    return {
      highestName: highest.name,
      highestPremium: Number(highest.extraPrice || 0),
      highestDiff,
      lowestName: lowest.name,
      lowestPremium: Number(lowest.extraPrice || 0),
      lowestDiff,
      avgPremium
    };
  }, [grades]);

  return (
    <Card className="shadow-sm border-slate-200 flex flex-col h-[280px] max-h-[280px]">
      <CardHeader className="bg-[#fafbfd] border-b border-slate-100 py-2.5 px-4 shrink-0 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
          <DollarSign className="size-3.5 text-[#0b5cbf]" /> Cost Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex-1 flex flex-col justify-between overflow-hidden gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-between">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[60px] bg-slate-50 border border-slate-100 rounded p-2 animate-pulse" />
            ))}
          </div>
        ) : !stats ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
            No grade data available
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full justify-between">
            {/* Highest Premium */}
            <div className="flex items-center justify-between border border-slate-200 border-l-4 border-l-red-500 rounded bg-white p-2 text-xs">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Highest Premium</span>
                <span className="font-bold text-slate-700 truncate" title={stats.highestName}>
                  {stats.highestName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-extrabold text-slate-900">₹{stats.highestPremium.toFixed(2)}</span>
                  <div className="flex items-center gap-0.5 text-[10px] text-red-600 font-bold">
                    <TrendingUp className="size-3" />
                    <span>+{stats.highestDiff.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest Premium */}
            <div className="flex items-center justify-between border border-slate-200 border-l-4 border-l-green-500 rounded bg-white p-2 text-xs">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lowest Premium</span>
                <span className="font-bold text-slate-700 truncate" title={stats.lowestName}>
                  {stats.lowestName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-extrabold text-slate-900">₹{stats.lowestPremium.toFixed(2)}</span>
                  <div className="flex items-center gap-0.5 text-[10px] text-green-600 font-bold">
                    <TrendingDown className="size-3" />
                    <span>-{stats.lowestDiff.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Premium */}
            <div className="flex items-center justify-between border border-slate-200 border-l-4 border-l-[#0b5cbf] rounded bg-white p-2 text-xs">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Premium</span>
                <span className="font-bold text-slate-500 truncate">Across all grades</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-extrabold text-slate-900">₹{stats.avgPremium.toFixed(2)}</span>
                  <div className="flex items-center gap-0.5 text-[10px] text-slate-500 font-bold">
                    <Sparkles className="size-3 text-[#0b5cbf]" />
                    <span>Baseline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
