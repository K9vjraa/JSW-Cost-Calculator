import { 
  Calculator, 
  IndianRupee, 
  Layers3, 
  PackagePlus, 
  Users, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Core design system imports
import { 
  KPICard, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Button, 
  AlertCard, 
  ChartContainer,
  inr 
} from "@jsw-mcms/ui";

import { CalculationLine, DoughnutMetric, CostBars } from "@/components/Charts";
import { ImportFerroAlloyExcel } from "@/components/ImportFerroAlloyExcel";
import { useAuth } from "@/store/auth";
import { shortDate } from "@/utils";
import { apiClient } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import type { Calculation } from "@/types";
import { quickActionsConfig } from "@/config/navigation";
import { RefreshCcw } from "lucide-react";

/* ----------------------------------------------------
   DENSITY STATUS BADGE FORMATTER
   ---------------------------------------------------- */
function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
      value === "COMPLETED" 
        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
        : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {value}
    </span>
  );
}

/* ----------------------------------------------------
   SKELETON LOADER PANEL WRAPPER
   ---------------------------------------------------- */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="h-20 bg-white border border-[#e5e7eb] rounded" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, idx) => (
          <div key={idx} className="h-28 bg-white border border-[#e5e7eb] rounded" />
        ))}
      </div>
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="h-[340px] bg-white border border-[#e5e7eb] rounded" />
        <div className="h-[340px] bg-white border border-[#e5e7eb] rounded" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   ERROR STATE WRAPPER
   ---------------------------------------------------- */
function DashboardError({ retry }: { retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] w-full gap-4 bg-slate-50 border border-slate-200 rounded-sm">
      <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
        <Activity className="size-6" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">Dashboard Failed to Load</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">We couldn't connect to the costing server. This might be due to a network issue or server maintenance.</p>
      </div>
      <Button onClick={retry} variant="outline" leftIcon={<RefreshCcw className="size-4" />}>
        Retry Connection
      </Button>
    </div>
  );
}

/* ----------------------------------------------------
   MAIN ENTRY PAGE COMPONENT
   ---------------------------------------------------- */
export function DashboardPage() {
  const { actor } = useAuth();
  console.log("[TRACE] DashboardPage Mounted: actor=", actor);
  return actor?.role === "COSTING_DEPARTMENT" ? <AdminDashboard /> : <UserDashboard />;
}

/* ----------------------------------------------------
   1️⃣ PREMIUM ADMIN EXECUTIVE LEVEL DASHBOARD
   ---------------------------------------------------- */
function AdminDashboard() {
  const navigate = useNavigate();
  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/admin");
      return data;
    }
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <DashboardError retry={refetch} />;

  const data = rawData || {};
  const kpis = data?.kpis || {};
  const series = data?.series || [];
  const topAlloys = data?.topAlloys || [];
  const statuses = data?.statuses || [];
  const activity = data?.activity || [];
  const recent = data?.recent || [];
  const systemSummary = data?.systemSummary || {};
  const notices = data?.notices || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      {/* Dynamic JSW Executive Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            JSW Production Control Hub
          </p>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            System Control Dashboard
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-semibold">
          <ShieldCheck className="size-3.5 text-slate-600" />
          <span>Costing Department Level</span>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard
          title="Calculations Saved"
          value={(kpis.calculations ?? 0).toLocaleString("en-IN")}
          icon={<Calculator className="size-4.5" />}
          trend={{ value: "18.6% up", isPositive: true, label: "this month" }}
        />
        <KPICard
          title="Configured Alloys"
          value={String(kpis.alloys ?? 0)}
          icon={<Layers3 className="size-4.5" />}
          trend={{ value: "12% up", isPositive: true, label: "catalog" }}
          isLocked
        />
        <KPICard
          title="Raw Ingredients"
          value={String(kpis.rawMaterials ?? 0)}
          icon={<PackagePlus className="size-4.5" />}
          trend={{ value: "Prices locked", isPositive: true, label: "master" }}
          isLocked
        />
        <KPICard
          title="Est. Billing Volume"
          value={inr(kpis.estimatedValue ?? 0)}
          icon={<IndianRupee className="size-4.5" />}
          trend={{ value: "4.2% up", isPositive: true, label: "demand" }}
        />
        <KPICard
          title="Controlled Access Users"
          value={String(kpis.activeUsers ?? 0)}
          icon={<Users className="size-4.5" />}
          trend={{ value: "Active", isPositive: true, label: "online" }}
        />
      </div>

      {/* Admin Utility for Excel Import */}
      <ImportFerroAlloyExcel />

      {/* Primary Graphs and Fast Action Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        
        {/* Cost Indices Trend Chart */}
        <ChartContainer
          title="Calculations Cost Value Trends"
          subtitle="Live calculation cost indices updated by price masters"
        >
          <div className="w-full h-56">
            <CalculationLine points={series} />
          </div>
        </ChartContainer>

        {/* Operational Quick Actions Panel */}
        <Card className="flex flex-col h-full justify-between">
          <CardHeader>
            <CardTitle>Operational Quick Actions</CardTitle>
            <CardDescription>Procurement workflow actions trigger points</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-3">
            {quickActionsConfig.COSTING.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Button 
                  key={idx}
                  variant={(action.variant as any) || "primary"} 
                  className={`w-full h-9 ${action.variant === 'secondary' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : action.variant === 'outline' ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : ''}`}
                  leftIcon={<Icon className="size-4" />}
                  onClick={() => navigate(action.to)}
                >
                  {action.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Composition Analysis Row */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        
        {/* Doughnut 1: Alloys distribution */}
        <ChartContainer
          title="Alloy Category Distribution"
          subtitle="Top active JSW metal recipes composition"
        >
          <div className="w-full">
            <DoughnutMetric rows={topAlloys} center={String(kpis.alloys ?? 0)} />
          </div>
        </ChartContainer>

        {/* Doughnut 2: Cost batch statuses */}
        <ChartContainer
          title="System Batch Run Success"
          subtitle="Completed vs draft calculations distribution"
        >
          <div className="w-full">
            <DoughnutMetric rows={statuses} center={String(kpis.calculations ?? 0)} />
          </div>
        </ChartContainer>

        {/* Timeline security audit logs */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Calculation Logs</CardTitle>
            <CardDescription>Recent master audit actions logged</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {activity.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity.</p>
            ) : activity.map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 border border-slate-200 p-2.5 rounded text-xs bg-white hover:bg-slate-50 transition-colors duration-150"
              >
                <div className="flex size-6.5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600">
                  <Activity className="size-3.5" />
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <strong className="block text-slate-900 text-xs font-semibold leading-tight">
                    {entry.entity} updated
                  </strong>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {entry.action.replace("_", " ")} by {entry.user?.name ?? "System Operator"}
                  </p>
                  <span className="inline-block text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded mt-1">
                    {shortDate(entry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations Table & Pricing Alerts */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        
        {/* Table panel */}
        <RecentCalculationsTable rows={recent} />
        
        {/* Surcharge alert and system notices */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Auditing Alerts</CardTitle>
            <CardDescription>Active price slab notifications</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            
            {/* System grid stats */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(systemSummary).map(([name, value]: any) => (
                <div 
                  key={name} 
                  className="rounded border border-slate-200 bg-slate-50 p-3 text-xs flex flex-col gap-0.5 text-left"
                >
                  <span className="font-semibold uppercase tracking-wider text-slate-500 text-[9px]">
                    {name.replace(/([A-Z])/g, " $1")}
                  </span>
                  <strong className="text-base font-semibold text-slate-950">{value}</strong>
                </div>
              ))}
            </div>

            {/* Glowing price notices */}
            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 text-center">No active alerts.</p>
            ) : notices.slice(0, 2).map((notice: any) => (
              <AlertCard
                key={notice.id}
                variant={notice.priority === "HIGH" ? "error" : "warning"}
                title={notice.title}
                description={notice.message}
                action={
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] font-semibold gap-0.5 px-2">
                    <span>Manage</span>
                    <ArrowRight className="size-3" />
                  </Button>
                }
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------
   2️⃣ USER LEVEL PROCUREMENTS DASHBOARD
   ---------------------------------------------------- */
/* ----------------------------------------------------
   4️⃣ PROCUREMENTS DENSE WORKFLOW STEPPER
   ---------------------------------------------------- */
function CostingWorkflowStepper() {
  const steps = [
    { title: "Workspace Simulation", desc: "Build alloy recipe & weights", status: "completed" },
    { title: "Master Price Sync", desc: "Sync locked pricing indexes", status: "active" },
    { title: "Surcharge & GST Validation", desc: "Calculate margins & multipliers", status: "pending" },
    { title: "Snapshot Commit", desc: "Commit batch run to ledger", status: "locked" }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Workflow Progress</CardTitle>
        <CardDescription>JSW cost allocation workflow stepper</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-left">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-3 relative group">
            {/* Stepper Connector Line */}
            {idx < steps.length - 1 && (
              <div 
                className={`absolute left-3 top-7 bottom-0 w-0.5 z-0 ${
                  step.status === "completed" ? "bg-emerald-500" : "bg-slate-200"
                }`} 
              />
            )}
            
            {/* Circular Step Badge */}
            <div 
              className={`z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                step.status === "completed" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : step.status === "active"
                  ? "bg-slate-100 border-jsw-corp text-jsw-corp"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              {step.status === "completed" ? "✓" : idx + 1}
            </div>

            {/* Stepper details */}
            <div className="flex flex-col gap-0.5">
              <strong 
                className={`text-xs font-semibold leading-none ${
                  step.status === "active" ? "text-jsw-corp" : "text-slate-800"
                }`}
              >
                {step.title}
              </strong>
              <span className="text-[10px] text-slate-500 leading-relaxed">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ----------------------------------------------------
   2️⃣ USER LEVEL PROCUREMENTS DASHBOARD
   ---------------------------------------------------- */
function UserDashboard() {
  const navigate = useNavigate();
  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: ["user-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/user");
      return data;
    }
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <DashboardError retry={refetch} />;

  const data = rawData || {};
  const kpis = data?.kpis || {};
  const series = data?.series || [];
  const saved = data?.saved || [];
  const recent = data?.recent || [];
  const notices = data?.notices || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      {/* JSW Operator Header Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            JSW Operator Cost Workspace
          </p>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Operational Cost Dashboard
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-semibold">
          <Sparkles className="size-3.5 text-slate-600" />
          <span>PDQC Access</span>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Your Calculations"
          value={String(kpis.calculations ?? 0)}
          icon={<Calculator className="size-4.5" />}
          trend={{ value: "12% up", isPositive: true, label: "vs last month" }}
        />
        <KPICard
          title="Saved Alloy Recipes"
          value={String(kpis.savedAlloys ?? 0)}
          icon={<Layers3 className="size-4.5" />}
          trend={{ value: "8% increase", isPositive: true, label: "catalog" }}
        />
        <KPICard
          title="Estimated Cost Run"
          value={inr(kpis.estimatedValue ?? 0)}
          icon={<IndianRupee className="size-4.5" />}
          trend={{ value: "Pricing locked", isPositive: true, label: "master" }}
        />
        <KPICard
          title="Recent Calculations"
          value={String(kpis.recentActivity ?? 0)}
          icon={<TrendingUp className="size-4.5" />}
          trend={{ value: "Live active", isPositive: true, label: "indices" }}
        />
      </div>

      {/* Row 2: Recent Calculations Table + Workflow Stepper + Fast Actions */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.7fr]">
        
        {/* Table panel */}
        <div className="lg:col-span-2 xl:col-span-1">
          <RecentCalculationsTable rows={recent} />
        </div>
        
        {/* Costing Workflow Stepper */}
        <div className="lg:col-span-1 xl:col-span-1">
          <CostingWorkflowStepper />
        </div>
        
        {/* Fast Action Cards */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Card className="flex flex-col justify-between h-full">
            <CardHeader>
              <CardTitle>Operator Actions</CardTitle>
              <CardDescription>Fast simulation actions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-3">
              {quickActionsConfig.PDQC.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={idx}
                    variant={(action.variant as any) || "primary"} 
                    className={`w-full h-9 ${action.variant === 'secondary' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : action.variant === 'outline' ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : ''}`}
                    leftIcon={<Icon className="size-4" />}
                    onClick={() => navigate(action.to)}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visual estimation cost curves + Saved alloys catalog + notices */}
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.3fr_0.85fr]">
        
        {/* Cost Curves Chart */}
        <ChartContainer
          title="Estimation Cost Curves"
          subtitle="Running seven-day indices tracker"
        >
          <div className="w-full">
            <CostBars points={series} />
          </div>
        </ChartContainer>

        {/* Recipe Cards List */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Alloy Recipes</CardTitle>
            <CardDescription>Active custom recipe parameters list</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {saved.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center col-span-2">No saved alloys found.</p>
            ) : saved.map((alloy: any) => (
              <div
                key={alloy.id}
                className="rounded border border-slate-200 p-3 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between relative group"
              >
                <div className="text-left">
                  <strong className="block text-slate-900 text-xs font-semibold leading-tight">
                    {alloy.name}
                  </strong>
                  <span className="inline-block text-[8px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider">
                    {alloy.type}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 w-full text-[10px] font-semibold rounded border-slate-200 text-slate-600 hover:bg-slate-50 mt-3"
                >
                  Load in Workspace
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts & notices list */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Alerts & Notices</CardTitle>
            <CardDescription>Dynamic price list events catalog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active alerts.</p>
            ) : notices.map((notice: any) => (
              <div 
                key={notice.id} 
                className="rounded border border-slate-200 p-2.5 text-xs bg-white hover:bg-slate-50 transition-colors flex flex-col gap-1 text-left"
              >
                <strong className="font-semibold text-slate-900 text-[11px] leading-tight">
                  {notice.title}
                </strong>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {notice.message}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------
   3️⃣ REUSABLE DATA TABLE FOR RECENT BATCH RUNS
   ---------------------------------------------------- */
function RecentCalculationsTable({ rows }: { rows: Calculation[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Batch Calculations</CardTitle>
        <CardDescription>Live simulation runs saved by procurement</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="table-responsive">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Code</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alloy Name</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight (kg)</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Price</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Calculation Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">No recent calculations found.</TableCell>
                </TableRow>
              ) : rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-900 font-semibold">{row.batchId}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{row.alloy?.name ?? row.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-600">
                    {Number(row.totalQuantity).toLocaleString("en-IN")} kg
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-900 font-semibold">
                    {inr(row.finalCost)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge value={row.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-500">
                    {shortDate(row.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
