import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChartIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface GradeDistributionChartProps {
  grades?: any[];
  isLoading?: boolean;
}

const COLORS = ['#0b5cbf', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8', '#ec4899', '#06b6d4'];

export const GradeDistributionChart = memo(function GradeDistributionChart({ grades = [], isLoading = false }: GradeDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const counts: Record<string, number> = {};
    grades.forEach(g => {
      const cat = g.metal?.name || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = grades.length;
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    const maxSegments = 7;
    const topEntries = sortedEntries.slice(0, maxSegments - 1);
    const othersEntries = sortedEntries.slice(maxSegments - 1);
    
    let chartData = topEntries.map(([name, value], index) => ({
      name,
      value,
      percentage: `${Math.round((value / total) * 100)}%`,
      color: COLORS[index % COLORS.length]
    }));
    
    if (othersEntries.length > 0) {
      const othersTotal = othersEntries.reduce((sum, [_, val]) => sum + val, 0);
      chartData.push({
        name: "Others",
        value: othersTotal,
        percentage: `${Math.round((othersTotal / total) * 100)}%`,
        color: "#cbd5e1" // Slate-300
      });
    }

    return chartData;
  }, [grades]);

  const total = grades?.length || 0;

  return (
    <Card className="shadow-sm border-slate-200 flex flex-col h-[280px] max-h-[280px]">
      <CardHeader className="bg-[#fafbfd] border-b border-slate-100 py-2.5 px-4 shrink-0 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
          <PieChartIcon className="size-3.5 text-[#0b5cbf]" /> Grade Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 flex flex-row relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-row">
            <div className="w-[45%] h-full flex items-center justify-center p-2">
              <div className="size-24 rounded-full border-8 border-slate-100 animate-pulse" />
            </div>
            <div className="w-[55%] pr-4 py-4 flex flex-col justify-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-6 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
            No grade data available
          </div>
        ) : (
          <>
            <div className="w-[45%] h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '4px', border: 'none', fontSize: '10px', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-800 leading-none">{total}</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="w-[55%] pr-2 py-1 flex flex-col justify-center gap-1.5 overflow-y-auto">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-600 truncate" title={item.name}>
                      {item.name} <span className="text-slate-400 font-medium">({item.value})</span>
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0 ml-1">{item.percentage}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
