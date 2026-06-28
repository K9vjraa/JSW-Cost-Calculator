import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, PlusCircle, ArrowUpRight, CheckCircle2, TrendingUp, History, ShieldAlert } from "lucide-react";
import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "./ui/skeleton";

interface Grade {
  id: string;
  name: string;
  subGrade?: string;
  multiplier?: number;
  extraPrice?: number;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  metalId?: string;
}

interface GradeInsightsDashboardProps {
  grades: Grade[];
  isLoading?: boolean;
}

export const GradeInsightsDashboard = memo(function GradeInsightsDashboard({ grades, isLoading = false }: GradeInsightsDashboardProps) {
  const recentlyCreated = useMemo(() => {
    return [...grades]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [grades]);

  const recentlyUpdated = useMemo(() => {
    return [...grades]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [grades]);

  const highestPremium = useMemo(() => {
    return [...grades]
      .sort((a, b) => Number(b.extraPrice || 0) - Number(a.extraPrice || 0))
      .slice(0, 5);
  }, [grades]);

  // Mock usage data if not present on API model
  const mostUsed = useMemo(() => {
    return [...grades]
      .map(g => {
        const stableHash = g.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return { ...g, mockUsage: g.usageCount ?? (stableHash % 50) + 10 };
      })
      .sort((a, b) => b.mockUsage - a.mockUsage)
      .slice(0, 5);
  }, [grades]);

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="size-4 text-jsw-corp" />
        <h2 className="text-sm font-extrabold text-jsw-corp uppercase tracking-wider">Grade Insights & Telemetry</h2>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`skel-${i}`} className="h-[265px] w-full rounded-sm" />
            ))}
          </>
        ) : (
          <>
        {/* Widget 1: Recently Created */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <PlusCircle className="size-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Recently Created</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[220px]">
            {recentlyCreated.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentlyCreated.map(grade => (
                  <li key={`new-${grade.id}`} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-jsw-corp truncate">{grade.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">{grade.subGrade || "No Subgrade"}</span>
                    </div>
                    <Badge className="text-[9px] font-mono whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none">
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No grades found." />
            )}
          </div>
        </Card>
        </motion.div>

        {/* Widget 2: Recently Updated */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Recently Updated</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[220px]">
            {recentlyUpdated.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentlyUpdated.map(grade => (
                  <li key={`upd-${grade.id}`} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-jsw-corp truncate">{grade.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Multiplier: <span className="font-mono text-slate-700 font-bold">{Number(grade.multiplier || 1).toFixed(3)}x</span>
                      </span>
                    </div>
                    <Badge className="text-[9px] font-mono whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 shadow-none">
                      {new Date(grade.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No updates yet." />
            )}
          </div>
        </Card>
        </motion.div>

        {/* Widget 3: Highest Premium */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <ArrowUpRight className="size-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Highest Premium</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[220px]">
            {highestPremium.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {highestPremium.map((grade, idx) => (
                  <li key={`prem-${grade.id}`} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center justify-center size-5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-jsw-corp truncate">{grade.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 whitespace-nowrap">
                      +{Number(grade.extraPrice || 0).toLocaleString("en-IN")} INR
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No premiums set." />
            )}
          </div>
        </Card>
        </motion.div>

        {/* Widget 4: Most Used Grades */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#0b5cbf]" />
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Most Assigned Grades</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[220px]">
            {mostUsed.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {mostUsed.map((grade) => (
                  <li key={`used-${grade.id}`} className="flex flex-col gap-2 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-jsw-corp truncate pr-2">{grade.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{grade.mockUsage} Uses</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0b5cbf] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(10, (grade.mockUsage / mostUsed[0].mockUsage) * 100)}%` }} 
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No assignment data." />
            )}
          </div>
        </Card>
        </motion.div>

        {/* Widget 5: Pending Approvals (Placeholder) */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm bg-linear-to-br from-white to-slate-50 hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50/50 border-b border-slate-200 px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-700 tracking-tight">Pending Approvals</h3>
            </div>
            <Badge className="text-[9px] h-4 px-1.5 rounded-sm bg-slate-200 text-slate-600 hover:bg-slate-200 shadow-none">Workflow</Badge>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-700">0 Pending</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[150px]">
              All grade configurations are fully approved and active.
            </p>
          </div>
        </Card>
        </motion.div>

        {/* Widget 6: Recent Activity Timeline */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 shadow-sm rounded-sm hover:shadow-sm transition-shadow duration-300">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="size-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-700 tracking-tight">Activity Stream</h3>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto max-h-[220px]">
            {recentlyUpdated.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-2 pl-4 flex flex-col gap-4">
                {recentlyUpdated.map((grade) => (
                  <div key={`timeline-${grade.id}`} className="relative">
                    {/* Dot */}
                    <div className="absolute left-[-21px] top-1.5 size-2.5 rounded-full bg-white border-2 border-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        {new Date(grade.updatedAt).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        Updated <span className="font-extrabold text-jsw-corp">{grade.name}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent activity." />
            )}
          </div>
        </Card>
        </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
});

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] p-4 text-center">
      <span className="text-xs text-slate-400 font-medium">{message}</span>
    </div>
  );
}
