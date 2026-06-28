import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

export interface MostUsedGradesCardProps {
  grades?: any[];
  isLoading?: boolean;
}

export function MostUsedGradesCard({ grades = [], isLoading = false }: MostUsedGradesCardProps) {
  const chartData = useMemo(() => {
    if (!grades || grades.length === 0) return [];
    
    // Sort by multiplier to simulate "usage"
    const sorted = [...grades].sort((a, b) => (b.multiplier || 0) - (a.multiplier || 0));
    
    // Take top 5
    const top5 = sorted.slice(0, 5);
    
    // Normalize multipliers to percentages for the chart
    const totalMultiplier = top5.reduce((sum, g) => sum + (g.multiplier || 1), 0);
    
    return top5.map(g => ({
      name: g.name,
      value: totalMultiplier > 0 ? Math.round(((g.multiplier || 1) / totalMultiplier) * 100) : 0
    }));
  }, [grades]);

  return (
    <Card className="shadow-sm border-slate-200 flex flex-col h-[280px] max-h-[280px]">
      <CardHeader className="bg-[#fafbfd] border-b border-slate-100 py-2.5 px-4 shrink-0 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
          <BarChart3 className="size-3.5 text-[#0b5cbf]" /> Top 5 Most Used Grades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3.5 flex-1 flex flex-col justify-between overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
            No grade data available
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 justify-between h-full">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate max-w-[80%]" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">{item.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0b5cbf] rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

