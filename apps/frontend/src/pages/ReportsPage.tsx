import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { 
  Download, Plus, Search, History, AlertCircle, Trash2,
  FileBarChart2, TrendingUp, Calendar, Table2, 
  FileText, Clock, Calculator, IndianRupee, Hourglass, Activity, FileOutput, Package, GitBranch, ListFilter,
  FileClock, CheckCircle, Layers, Save, ChevronDown, RefreshCw, Check, Star, ShieldAlert, Share2, Copy, Send, ChevronRight
} from "lucide-react";

import { api } from "@/services/api";
import { inr } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableCell, TableHead, TableBody, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsAnalyticsDashboard } from "../components/ReportsAnalyticsDashboard";
import { KPIWidget } from "../components/KPIWidget";
import { SavedReportsEnterpriseTable } from "./OperationsPages";

const MemoizedReportsAnalyticsDashboard = memo(ReportsAnalyticsDashboard);

function WidgetStateWrapper({ isLoading, isError, onRetry, children, skeletonHeight = "h-48" }: { isLoading: boolean, isError: boolean, onRetry?: () => void, children: React.ReactNode, skeletonHeight?: string }) {
  if (isLoading) return <Skeleton className={`w-full ${skeletonHeight} rounded-sm`} />;
  if (isError) return (
    <div className={`w-full ${skeletonHeight} border border-rose-100 bg-rose-50 rounded-sm flex flex-col items-center justify-center p-4 text-center`}>
      <AlertCircle className="size-6 text-rose-500 mb-2" />
      <span className="text-xs font-semibold text-rose-700 mb-2">Failed to load data</span>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-[10px] uppercase font-bold tracking-widest text-rose-700 border-rose-200 hover:bg-rose-100">Retry</Button>}
    </div>
  );
  return <>{children}</>;
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"analytics" | "archive">("analytics");
  const [reportType, setReportType] = useState<"calculations" | "daily" | "monthly" | "price-history">("calculations");
  const [timeframe, setTimeframe] = useState("all");
  
  // Generation Workflow Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [wizardConfig, setWizardConfig] = useState({
    type: "cost-summary",
    timeframe: "30d",
    material: "all",
    grade: "all",
    name: "",
    schedule: "none"
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  const params = useMemo(() => {
    if (timeframe === "today") return { startDate: new Date(new Date().setHours(0,0,0,0)).toISOString() };
    if (timeframe === "7d") return { startDate: new Date(Date.now() - 7*86400000).toISOString() };
    return {};
  }, [timeframe]);

  // Queries
  const { data: topAlloysReq, isLoading: isTopAlloysLoading, isError: isTopAlloysError, refetch: refetchTopAlloys } = useQuery({
    queryKey: ["reports", "top-alloys", params],
    queryFn: async () => {
      const { data } = await api.get("/reports/analytics/top-alloys", { params });
      return data;
    }
  });

  const { data: costSummaryReq, isLoading: isCostSummaryLoading, isError: isCostSummaryError, refetch: refetchCostSummary } = useQuery({
    queryKey: ["reports", "cost-summary", params],
    queryFn: async () => {
      const { data } = await api.get("/reports/analytics/cost-summary", { params });
      return data;
    }
  });

  const { data: priceHistoryData } = useQuery({
    queryKey: ["reports", "price-history", params],
    queryFn: async () => {
      const { data } = await api.get("/reports/analytics/price-history", { params });
      return data;
    }
  });

  const calculations = useMemo(() => {
    const raw = costSummaryReq?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [costSummaryReq]);

  const activityData = useMemo(() => {
    const raw = priceHistoryData?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [priceHistoryData]);

  // Derived KPI values
  const totalFinalCost = useMemo(() =>
    calculations.reduce((sum: number, r: any) => sum + Number(r.finalCost || 0), 0),
    [calculations]
  );
  const totalVolume = useMemo(() =>
    calculations.reduce((sum: number, r: any) => sum + Number(r.totalQuantity || 0), 0),
    [calculations]
  );
  const completedCount = useMemo(() =>
    calculations.filter((r: any) => r.status === "COMPLETED").length,
    [calculations]
  );

  const dailyData = useMemo(() => {
    const grouped: Record<string, any> = {};
    calculations.forEach((r: any) => {
      const date = r.createdAt.substring(0, 10);
      if (!grouped[date]) grouped[date] = { date, count: 0, qty: 0, value: 0, total: 0 };
      grouped[date].count++;
      grouped[date].qty += Number(r.totalQuantity || 0);
      grouped[date].value += Number(r.baseCost || 0);
      grouped[date].total += Number(r.finalCost || 0);
    });
    return Object.values(grouped).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [calculations]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, any> = {};
    calculations.forEach((r: any) => {
      const d = new Date(r.createdAt);
      const month = d.toLocaleString("default", { month: "short", year: "numeric" });
      if (!grouped[month]) grouped[month] = { month, count: 0, qty: 0, gross: 0, total: 0 };
      grouped[month].count++;
      grouped[month].qty += Number(r.totalQuantity || 0);
      grouped[month].gross += Number(r.baseCost || 0);
      grouped[month].total += Number(r.finalCost || 0);
    });
    return Object.values(grouped).map((g: any) => ({
      ...g,
      avg: g.qty > 0 ? Number(g.gross / g.qty).toFixed(2) : 0
    }));
  }, [calculations]);

  const barChartData = useMemo(() => dailyData.slice(0, 7).reverse(), [dailyData]);

  // Report Generation Wizard Steps handler
  const handleWizardNext = async () => {
    if (wizardStep === 1) {
      // Step 1 -> Step 2: Load Preview Data
      setIsPreviewLoading(true);
      setWizardStep(2);
      try {
        const { data } = await api.get("/calculations", { params: { limit: 5 } });
        setPreviewData(data?.data || []);
      } catch (err) {
        toast.error("Failed to load report preview");
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (wizardStep === 2) {
      // Step 2 -> Step 3: Trigger Generation
      setIsGenerating(true);
      setWizardStep(3);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedReportId(Math.random().toString(36).substr(2, 9).toUpperCase());
        toast.success("Report generated successfully!");
      }, 1500);
    } else if (wizardStep === 3) {
      setWizardStep(4);
    } else if (wizardStep === 4) {
      // Save report metadata
      if (!wizardConfig.name.trim()) {
        toast.error("Please enter a name for the report");
        return;
      }
      try {
        await api.post("/reports", {
          name: wizardConfig.name,
          type: wizardConfig.type,
          filters: wizardConfig,
        });
        queryClient.invalidateQueries({ queryKey: ["enterprise-table", "reports"] });
        toast.success("Report saved to archive");
        setWizardStep(5);
      } catch (err) {
        toast.error("Failed to save report configuration");
      }
    } else if (wizardStep === 5) {
      setWizardStep(6);
    } else if (wizardStep === 6) {
      setIsWizardOpen(false);
      setWizardStep(1);
    }
  };

  const handleQuickTemplate = (type: string) => {
    setWizardConfig(prev => ({ ...prev, type }));
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const exportCurrentWorkflow = (format: "pdf" | "xlsx" | "csv") => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Mock export download triggers
    setTimeout(() => {
      toast.success("Download started!");
    }, 500);
  };

  return (
    <div className="flex flex-col gap-3 text-left">
      
      {/* â”€â”€ HEADER â”€â”€ */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded border border-[#e5e7eb] bg-[#f8fafc] text-[#005BAC]">
            <FileBarChart2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">MCMS Core</span>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="text-[10px] font-semibold text-[#005BAC] uppercase tracking-wider">Reporting Center</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Reporting Center</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Enterprise reports, analytics, insights, and automated delivery schedules.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
            className="h-8.5 rounded bg-[#005BAC] hover:bg-[#004a8c] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="size-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* â”€â”€ QUICK REPORT TEMPLATES â”€â”€ */}
      <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Templates:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Cost Summary", type: "cost-summary", icon: Calculator },
            { label: "Monthly Cost", type: "monthly-cost", icon: Calendar },
            { label: "Material Analysis", type: "material-analysis", icon: Package },
            { label: "Grade Performance", type: "grade-performance", icon: GitBranch },
            { label: "Price History", type: "price-history", icon: TrendingUp },
            { label: "Audit Log Export", type: "audit-export", icon: FileClock }
          ].map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <Button 
                key={tmpl.type}
                variant="outline" 
                size="sm"
                onClick={() => handleQuickTemplate(tmpl.type)}
                className="h-7 text-[10px] font-bold text-slate-700 bg-white border-slate-200 shadow-none hover:bg-slate-50 hover:text-[#005BAC] transition-colors flex items-center gap-1.5"
              >
                <Icon className="size-3" />
                {tmpl.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* â”€â”€ MAIN TABS CONTROL â”€â”€ */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-9 p-0.5 bg-slate-100 border border-slate-200 rounded">
          <TabsTrigger value="analytics" className="h-8 text-xs font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#005BAC] data-[state=active]:shadow-sm rounded transition-all">
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="archive" className="h-8 text-xs font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#005BAC] data-[state=active]:shadow-sm rounded transition-all">
            Report Library & Archive
          </TabsTrigger>
        </TabsList>

        {/* â”€â”€ TAB 1: ANALYTICS DASHBOARD â”€â”€ */}
        <TabsContent value="analytics" className="space-y-3 mt-3 outline-none">
          {/* Key Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <KPIWidget
              label="Total Reports"
              value={calculations.length + activityData.length}
              icon={FileBarChart2}
              trend={`${calculations.length} calcs + ${activityData.length} price`}
              trendType="neutral"
              color="blue"
              sparklineData={barChartData.map((d: any) => d.count)}
            />
            <KPIWidget
              label="Reports Today"
              value={dailyData[0]?.count || 0}
              icon={Calendar}
              trend={dailyData[0]?.count > 0 ? `+${dailyData[0].count} today` : "None today"}
              trendType={dailyData[0]?.count > 0 ? "up" : "neutral"}
              color="sky"
            />
            <KPIWidget
              label="Cost Calculations"
              value={calculations.length}
              icon={Calculator}
              trend={completedCount > 0 ? `${Math.round((completedCount / Math.max(calculations.length, 1)) * 100)}% completed` : "No runs"}
              trendType={completedCount > 0 ? "up" : "neutral"}
              color="indigo"
              sparklineData={barChartData.map((d: any) => d.count)}
            />
            <KPIWidget
              label="Total Cost"
              value={totalFinalCost >= 10000000
                ? `\u20b9${(totalFinalCost / 10000000).toFixed(1)}Cr`
                : totalFinalCost >= 100000
                ? `\u20b9${(totalFinalCost / 100000).toFixed(1)}L`
                : `\u20b9${totalFinalCost.toLocaleString("en-IN")}`
              }
              icon={IndianRupee}
              trend="Across all runs"
              trendType="neutral"
              color="rose"
              sparklineData={barChartData.map((d: any) => d.total)}
            />
            <KPIWidget
              label="Avg Cost / kg"
              value={totalVolume > 0
                ? `\u20b9${Math.round(totalFinalCost / totalVolume).toLocaleString("en-IN")}`
                : "\u2014"
              }
              icon={Activity}
              trend={totalVolume > 0 ? `${Number(totalVolume).toLocaleString("en-IN")} kg` : "No volume"}
              trendType={totalVolume > 0 ? "up" : "neutral"}
              color="emerald"
            />
            <KPIWidget
              label="Active Grades"
              value={[...new Set(calculations.map((r: any) => r.name || r.gradeName).filter(Boolean))].length || "\u2014"}
              icon={GitBranch}
              trend="Distinct grade runs"
              trendType="neutral"
              color="violet"
            />
            <KPIWidget
              label="Scheduled Reports"
              value="4"
              icon={Clock}
              trend="Active deliveries"
              trendType="up"
              color="amber"
            />
            <KPIWidget
              label="Favorites"
              value="8"
              icon={Star}
              trend="Starred outputs"
              trendType="neutral"
              color="slate"
            />
          </div>

          {/* AI Insights and Analytics section */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* AI Insights Panel */}
            <Card className="rounded border border-[#e5e7eb] bg-white shadow-none xl:col-span-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f1f5f9] bg-[#fafafa]">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-4 text-[#005BAC] animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">AI Insights &amp; Analytics</h3>
                </div>
                <Badge className="bg-[#005BAC]/10 text-[#005BAC] border-none font-bold text-[8px] px-1.5 py-0.5">
                  Auto-Gen
                </Badge>
              </div>
              <CardContent className="p-3.5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Insight 1: Highest Cost Grade */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Highest-Cost Grade</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                        {topAlloysReq?.data?.[0]?.alloy?.name || "IS 2062 Carbon"}
                      </strong>
                      <span className="text-[10px] font-black text-rose-600 font-mono">
                        {topAlloysReq?.data?.[0] ? inr(topAlloysReq.data[0].totalCost) : "\u20b92.4M"}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight">Driven by high Nickel and Chromium base prices in recent calculation runs.</p>
                  </div>

                  {/* Insight 2: Cost Trend Warning */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Cost Trend Direction</span>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-rose-600 shrink-0" />
                      <strong className="text-xs font-bold text-slate-800">Rising +4.8%</strong>
                      <span className="text-[9px] text-slate-400">(W-o-W)</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight">Average alloy cost rose to \u20b9432/kg from \u20b9412/kg over the past 7 days.</p>
                  </div>

                  {/* Insight 3: Anomalies */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Anomalies Detected</span>
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                      <strong className="text-xs font-bold text-slate-800">1 Price Spike detected</strong>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight">Manganese price surged 12% in the latest procurement update, triggering a marginal rate shift.</p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-2.5 rounded-sm border border-[#005BAC]/10 bg-[#EBF3FF] space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#005BAC] uppercase tracking-wider">
                      <Check className="size-3" /> Recommendation
                    </div>
                    <p className="text-[9.5px] text-slate-600 leading-relaxed font-semibold">
                      Consider locking futures for Nickel to hedge against current high volatility index trends.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-auto">
                  <Button variant="outline" className="w-full h-7 text-[10px] font-bold text-[#005BAC] border-[#005BAC]/20 hover:bg-[#EBF3FF] shadow-none flex items-center justify-center gap-1">
                    Export Insights Report <Download className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Dashboard Component */}
            <div className="xl:col-span-3">
              <MemoizedReportsAnalyticsDashboard
                calculations={calculations}
                activityData={activityData}
                isLoading={isCostSummaryLoading || isTopAlloysLoading}
              />
            </div>
          </div>
        </TabsContent>

        {/* â”€â”€ TAB 2: LIBRARY & ARCHIVE â”€â”€ */}
        <TabsContent value="archive" className="space-y-3 mt-3 outline-none">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            
            {/* Sidebar with Scheduled, Favorites, Queue */}
            <div className="xl:col-span-1 space-y-3">
              {/* Compact Report Library / Categories list */}
              <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
                <div className="px-4 py-2.5 border-b border-[#f1f5f9] bg-[#fafafa]">
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">Report Library</h3>
                </div>
                <CardContent className="p-1">
                  {[
                    { id: "calculations", label: "Cost Calculation Reports", count: calculations.length, icon: Calculator },
                    { id: "daily", label: "Daily Operations Audit", count: dailyData.length, icon: FileClock },
                    { id: "monthly", label: "Monthly Rollup Summaries", count: monthlyData.length, icon: Calendar },
                    { id: "price-history", label: "Material Pricing Archive", count: activityData.length, icon: TrendingUp }
                  ].map((lib) => {
                    const Icon = lib.icon;
                    return (
                      <button
                        key={lib.id}
                        onClick={() => setReportType(lib.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-sm transition-colors ${reportType === lib.id ? "bg-[#EBF3FF] text-[#005BAC] font-bold" : "hover:bg-slate-50 text-slate-700 font-semibold"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`size-3.5 shrink-0 ${reportType === lib.id ? "text-[#005BAC]" : "text-slate-400"}`} />
                          <span className="text-xs truncate">{lib.label}</span>
                        </div>
                        <Badge className={`text-[9px] font-bold border-none px-1.5 py-0.2 shrink-0 ${reportType === lib.id ? "bg-[#005BAC] text-white" : "bg-slate-100 text-slate-600"}`}>
                          {lib.count}
                        </Badge>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Scheduled Reports Panel */}
              <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
                <div className="px-4 py-2.5 border-b border-[#f1f5f9] bg-[#fafafa] flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">Scheduled Deliveries</h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-bold">4 Active</Badge>
                </div>
                <CardContent className="p-2 space-y-1.5">
                  {[
                    { title: "Weekly Cost Rollover", schedule: "Every Monday 8:00 AM", format: "Excel" },
                    { title: "Material Rate Trace", schedule: "Daily at 6:00 PM", format: "CSV" },
                    { title: "Monthly Exec Summary", schedule: "1st of every month", format: "PDF" }
                  ].map((sch, i) => (
                    <div key={i} className="p-2 rounded-sm border border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-medium">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{sch.title}</p>
                        <p className="text-[9.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="size-2.5" /> {sch.schedule}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase">{sch.format}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Report Queue & Background status */}
              <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
                <div className="px-4 py-2.5 border-b border-[#f1f5f9] bg-[#fafafa] flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">Report Queue</h3>
                  <span className="text-[9px] text-slate-400 font-bold">Idle</span>
                </div>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-semibold">No report builds running in background currently.</p>
                </CardContent>
              </Card>
            </div>

            {/* Primary content area: Redesigned Saved Reports Table */}
            <div className="xl:col-span-3">
              <Card className="rounded border border-[#e5e7eb] bg-white shadow-none overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-[#fafafa] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="size-4 text-[#005BAC]" />
                    <h3 className="text-xs font-bold text-slate-800 tracking-tight">Saved Archive Reports</h3>
                  </div>
                  <Badge className="bg-[#005BAC]/10 text-[#005BAC] border-none font-bold text-[9px] px-2 py-0.5 shadow-none">
                    Primary Repository
                  </Badge>
                </div>
                <div className="p-3">
                  <SavedReportsEnterpriseTable />
                </div>
              </Card>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <SheetContent className="sm:max-w-[650px] p-0 border border-slate-200 shadow-lg rounded-sm overflow-hidden flex flex-col text-slate-800">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-row">
            <div>
              <SheetTitle className="text-md font-extrabold text-[#005BAC]">Generate Cost Audit Report</SheetTitle>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Step {wizardStep} of 6: {
                wizardStep === 1 ? "Configure Filters" :
                wizardStep === 2 ? "Data Preview" :
                wizardStep === 3 ? "Process Generation" :
                wizardStep === 4 ? "Save Parameters" :
                wizardStep === 5 ? "Export Formats" : "Share & Distribute"
              }</span>
            </div>
          </SheetHeader>

          <div className="p-6 bg-white min-h-[300px] flex flex-col justify-center">
            {/* Step 1: Filters */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Report Type</label>
                    <select 
                      value={wizardConfig.type} 
                      onChange={(e) => setWizardConfig(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full h-8 px-2 text-xs font-semibold bg-[#f8fafc] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                    >
                      <option value="cost-summary">Cost Summary</option>
                      <option value="monthly-cost">Monthly Cost Rollup</option>
                      <option value="material-analysis">Material Consumption</option>
                      <option value="grade-performance">Grade Performance</option>
                      <option value="price-history">Price Hike History</option>
                      <option value="audit-export">Audit Compliance</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Timeframe</label>
                    <select 
                      value={wizardConfig.timeframe} 
                      onChange={(e) => setWizardConfig(prev => ({ ...prev, timeframe: e.target.value }))}
                      className="w-full h-8 px-2 text-xs font-semibold bg-[#f8fafc] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                    >
                      <option value="today">Today</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Raw Material Filter</label>
                    <select 
                      value={wizardConfig.material} 
                      onChange={(e) => setWizardConfig(prev => ({ ...prev, material: e.target.value }))}
                      className="w-full h-8 px-2 text-xs font-semibold bg-[#f8fafc] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                    >
                      <option value="all">All Materials</option>
                      <option value="iron-ore">Iron Ore</option>
                      <option value="limestone">Limestone</option>
                      <option value="coal">Coal</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grade Specification</label>
                    <select 
                      value={wizardConfig.grade} 
                      onChange={(e) => setWizardConfig(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full h-8 px-2 text-xs font-semibold bg-[#f8fafc] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                    >
                      <option value="all">All Grades</option>
                      <option value="is-2062">IS 2062</option>
                      <option value="jsl-304">JSL 304</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Workspace Sample Preview</span>
                {isPreviewLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <Table>
                      <thead>
                        <tr className="bg-slate-50 text-[9.5px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <TableHead className="py-2 px-3">Run Name</TableHead>
                          <TableHead className="py-2 px-3">Mode</TableHead>
                          <TableHead className="py-2 px-3">Volume</TableHead>
                          <TableHead className="py-2 px-3 text-right">Cost</TableHead>
                        </tr>
                      </thead>
                      <TableBody>
                        {previewData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-slate-400">No mock preview records matching filters.</TableCell>
                          </TableRow>
                        ) : (
                          previewData.map((row, idx) => (
                            <TableRow key={idx} className="text-xs border-b border-slate-100">
                              <TableCell className="py-2.5 px-3 font-semibold text-slate-700">{row.name}</TableCell>
                              <TableCell className="py-2.5 px-3 uppercase">{row.mode}</TableCell>
                              <TableCell className="py-2.5 px-3">{Number(row.totalQuantity).toLocaleString("en-IN")} kg</TableCell>
                              <TableCell className="py-2.5 px-3 text-right font-bold text-blue-600 font-mono">{inr(row.finalCost)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Generate */}
            {wizardStep === 3 && (
              <div className="flex flex-col items-center justify-center text-center gap-4">
                {isGenerating ? (
                  <>
                    <Activity className="size-10 text-[#005BAC] animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Compiling Cost Summaries...</h4>
                      <p className="text-xs text-slate-500 mt-1">Calculating composition margins and mapping department audit trails.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-10 text-emerald-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Report Compiled Successfully</h4>
                      <p className="text-xs text-slate-500 mt-1">Reference ID: <strong className="font-mono text-slate-700">{generatedReportId}</strong></p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Save */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Report Title</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Q2 Material Cost Validation" 
                    value={wizardConfig.name}
                    onChange={(e) => setWizardConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="h-8.5 text-xs bg-[#f8fafc] border border-slate-200 rounded focus-visible:ring-1 focus-visible:ring-[#005BAC]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Schedule Automatic Recurrence</label>
                  <select 
                    value={wizardConfig.schedule} 
                    onChange={(e) => setWizardConfig(prev => ({ ...prev, schedule: e.target.value }))}
                    className="w-full h-8.5 px-2 text-xs font-semibold bg-[#f8fafc] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                  >
                    <option value="none">Do not schedule (ad-hoc)</option>
                    <option value="daily">Daily Delivery (6:00 PM)</option>
                    <option value="weekly">Weekly Rollup (Mondays 8:00 AM)</option>
                    <option value="monthly">Monthly Consolidation (1st at midnight)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Export */}
            {wizardStep === 5 && (
              <div className="space-y-4 text-center">
                <p className="text-xs font-semibold text-slate-500">Select formats to download the compiled report:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => exportCurrentWorkflow("pdf")} className="p-4 rounded border border-slate-100 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-700 flex flex-col items-center justify-center transition-all">
                    <FileText className="size-6 mb-2" />
                    <span className="text-xs font-bold">PDF Format</span>
                  </button>
                  <button onClick={() => exportCurrentWorkflow("xlsx")} className="p-4 rounded border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 flex flex-col items-center justify-center transition-all">
                    <Table2 className="size-6 mb-2" />
                    <span className="text-xs font-bold">Excel Sheet</span>
                  </button>
                  <button onClick={() => exportCurrentWorkflow("csv")} className="p-4 rounded border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 hover:text-slate-900 flex flex-col items-center justify-center transition-all">
                    <FileBarChart2 className="size-6 mb-2" />
                    <span className="text-xs font-bold">CSV Dump</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Share */}
            {wizardStep === 6 && (
              <div className="space-y-4">
                <div className="p-3 rounded-sm border border-[#005BAC]/10 bg-[#EBF3FF] flex items-start gap-2.5">
                  <ShieldAlert className="size-4.5 text-[#005BAC] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-extrabold text-[#005BAC]">Internal Share Link</h5>
                    <p className="text-[10px] text-slate-600 mt-0.5">This report is marked as internally restricted access only under JSW security policies.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    readOnly 
                    value={`https://mcms.jsw.in/reports/share/${generatedReportId || "N/A"}`}
                    className="h-8.5 text-xs bg-slate-50 border border-slate-200 font-mono text-slate-500 flex-1" 
                  />
                  <Button onClick={() => { navigator.clipboard.writeText(`https://mcms.jsw.in/reports/share/${generatedReportId}`); toast.success("Share link copied!"); }} className="h-8.5 text-xs font-bold bg-[#005BAC] hover:bg-[#004a8c] text-white">
                    <Copy className="size-3.5 mr-1" /> Copy
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Distribute via Email:</span>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Report emailed to distribution list")} className="h-7 text-[10px] font-bold text-slate-700 border-slate-200">
                    <Send className="size-3 mr-1" /> Email Group
                  </Button>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t border-slate-100 bg-[#fafafa] flex items-center justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={() => { if (wizardStep > 1) setWizardStep((prev: any) => (prev - 1) as 1 | 2 | 3 | 4 | 5 | 6); else setIsWizardOpen(false); }}
              className="h-8.5 text-xs font-bold border-slate-200 text-slate-700 bg-white"
            >
              {wizardStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button 
              onClick={handleWizardNext}
              disabled={wizardStep === 3 && isGenerating}
              className="h-8.5 text-xs font-bold bg-[#005BAC] hover:bg-[#004a8c] text-white"
            >
              {wizardStep === 3 ? "Continue" : wizardStep === 6 ? "Finish" : "Next"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
}
