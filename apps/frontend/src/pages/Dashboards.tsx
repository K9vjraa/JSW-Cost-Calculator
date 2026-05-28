import { 
  Calculator, 
  IndianRupee, 
  Layers3, 
  PackagePlus, 
  Users, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

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
  Badge, 
  Button, 
  AlertCard, 
  ChartContainer,
  inr 
} from "@jsw-mcms/ui";

import { CalculationLine, DoughnutMetric, CostBars } from "@/components/Charts";
import { adminDashboard, userDashboard } from "@/data/fixtures";
import { useAuth } from "@/store/auth";
import { useRemote } from "@/hooks/useRemote";
import { shortDate } from "@/utils";
import { getOrFixture } from "@/services/api";
import type { Calculation } from "@/types";

/* ----------------------------------------------------
   DENSITY STATUS BADGE FORMATTER
   ---------------------------------------------------- */
function StatusBadge({ value }: { value: string }) {
  const variant = value === "COMPLETED" ? "success" : "warning";
  return (
    <Badge variant={variant}>
      {value}
    </Badge>
  );
}

/* ----------------------------------------------------
   SKELETON LOADER PANEL WRAPPER
   ---------------------------------------------------- */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="h-20 bg-white border border-[#d6dfeb] rounded-2xl skeleton" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, idx) => (
          <div key={idx} className="h-28 bg-white border border-[#d6dfeb] rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="h-[340px] bg-white border border-[#d6dfeb] rounded-2xl skeleton" />
        <div className="h-[340px] bg-white border border-[#d6dfeb] rounded-2xl skeleton" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   MAIN ENTRY PAGE COMPONENT
   ---------------------------------------------------- */
export function DashboardPage() {
  const { actor } = useAuth();
  return actor?.role === "ADMIN" ? <AdminDashboard /> : <UserDashboard />;
}

/* ----------------------------------------------------
   1️⃣ PREMIUM ADMIN EXECUTIVE LEVEL DASHBOARD
   ---------------------------------------------------- */
function AdminDashboard() {
  const { data, loading } = useRemote(
    () => getOrFixture("/dashboard/admin", adminDashboard), 
    adminDashboard
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      {/* Dynamic JSW Executive Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-[#d6dfeb] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#0057b8]" />
        
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#0057b8]">
            JSW Production Control Hub
          </p>
          <h2 className="text-xl font-black text-[#10233d] uppercase tracking-wide mt-0.5">
            System Control Dashboard
          </h2>
        </div>

        <Badge variant="info" icon={<ShieldCheck className="size-3.5" />}>
          Admin Executive Level
        </Badge>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard
          title="Calculations Saved"
          value={data.kpis.calculations.toLocaleString("en-IN")}
          icon={<Calculator className="size-4.5 text-[#0057b8]" />}
          trend={{ value: "18.6% up", isPositive: true, label: "this month" }}
        />
        <KPICard
          title="Configured Alloys"
          value={String(data.kpis.alloys)}
          icon={<Layers3 className="size-4.5 text-[#087443]" />}
          trend={{ value: "12% up", isPositive: true, label: "catalog" }}
          isLocked
        />
        <KPICard
          title="Raw Ingredients"
          value={String(data.kpis.rawMaterials)}
          icon={<PackagePlus className="size-4.5 text-[#f2994a]" />}
          trend={{ value: "Prices locked", isPositive: true, label: "master" }}
          isLocked
        />
        <KPICard
          title="Est. Billing Volume"
          value={inr(data.kpis.estimatedValue)}
          icon={<IndianRupee className="size-4.5 text-[#d63031]" />}
          trend={{ value: "4.2% up", isPositive: true, label: "demand" }}
        />
        <KPICard
          title="Controlled Access Users"
          value={String(data.kpis.activeUsers)}
          icon={<Users className="size-4.5 text-[#0057b8]" />}
          trend={{ value: "Active", isPositive: true, label: "online" }}
        />
      </div>

      {/* Primary Graphs and Fast Action Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        
        {/* Cost Indices Trend Chart */}
        <ChartContainer
          title="Calculations Cost Value Trends"
          subtitle="Live calculation cost indices updated by price masters"
        >
          <div className="w-full h-56">
            <CalculationLine points={data.series} />
          </div>
        </ChartContainer>

        {/* Operational Quick Actions Panel */}
        <Card className="flex flex-col h-full justify-between">
          <CardHeader>
            <CardTitle>Operational Quick Actions</CardTitle>
            <CardDescription>Procurement workflow actions trigger points</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-3">
            <Button 
              className="w-full h-10 shadow-sm"
              leftIcon={<Calculator className="size-4" />}
            >
              Run Calculation Workspace
            </Button>
            <Button 
              variant="secondary" 
              className="w-full h-10"
              leftIcon={<Layers3 className="size-4" />}
            >
              Add Alloy Recipe
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-10 border-[#d6dfeb]"
              leftIcon={<PackagePlus className="size-4" />}
            >
              Add Metal Grade
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-10 border-[#d6dfeb]"
              leftIcon={<Zap className="size-4" />}
            >
              Master Price Update
            </Button>
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
            <DoughnutMetric rows={data.topAlloys} center={String(data.kpis.alloys)} />
          </div>
        </ChartContainer>

        {/* Doughnut 2: Cost batch statuses */}
        <ChartContainer
          title="System Batch Run Success"
          subtitle="Completed vs draft calculations distribution"
        >
          <div className="w-full">
            <DoughnutMetric rows={data.statuses} center={String(data.kpis.calculations)} />
          </div>
        </ChartContainer>

        {/* Timeline security audit logs */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Calculation Logs</CardTitle>
            <CardDescription>Recent master audit actions logged</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {data.activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl border border-[#d6dfeb] p-3 text-xs bg-slate-50/50 hover:bg-white transition-colors duration-200 shadow-sm"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf5ff] text-[#0057b8]">
                  <Activity className="size-4" />
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <strong className="block text-slate-800 text-xs font-bold leading-tight">
                    {entry.entity} updated
                  </strong>
                  <p className="text-[10px] text-[#56657a] font-semibold">
                    {entry.action.replace("_", " ")} by {entry.user?.name ?? "System Operator"}
                  </p>
                  <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-1.5">
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
        <RecentCalculationsTable rows={data.recent} />
        
        {/* Surcharge alert and system notices */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Auditing Alerts</CardTitle>
            <CardDescription>Active price slab notifications</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            
            {/* System grid stats */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.systemSummary).map(([name, value]) => (
                <div 
                  key={name} 
                  className="rounded-xl border border-[#d6dfeb] bg-[#fafcff] p-3 text-xs flex flex-col gap-0.5 text-left shadow-sm"
                >
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    {name.replace(/([A-Z])/g, " $1")}
                  </span>
                  <strong className="text-lg font-black text-slate-700">{value}</strong>
                </div>
              ))}
            </div>

            {/* Glowing price notices */}
            {data.notices.slice(0, 2).map((notice) => (
              <AlertCard
                key={notice.id}
                variant={notice.priority === "HIGH" ? "error" : "warning"}
                title={notice.title}
                description={notice.message}
                action={
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] font-extrabold gap-0.5 px-2">
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
    { title: "Workspace Simulation", desc: "Build alloy recipe & materials weight", status: "completed" },
    { title: "Master Price Sync", desc: "Sync locked pricing indexes", status: "active" },
    { title: "Surcharge & GST Validation", desc: "Calculate margins & base multipliers", status: "pending" },
    { title: "Snapshot Commit", desc: "Commit batch run to snapshot ledger", status: "locked" }
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
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 z-0 ${
                  step.status === "completed" ? "bg-[#087443]" : "bg-slate-200"
                }`} 
              />
            )}
            
            {/* Circular Step Badge */}
            <div 
              className={`z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                step.status === "completed" 
                  ? "bg-[#e8fbf0] border-[#bde4cf] text-[#087443]" 
                  : step.status === "active"
                  ? "bg-[#edf5ff] border-[#bfd6f5] text-[#0057b8] animate-pulse"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              {step.status === "completed" ? "✓" : idx + 1}
            </div>

            {/* Stepper details */}
            <div className="flex flex-col gap-0.5">
              <strong 
                className={`text-xs font-bold leading-none ${
                  step.status === "active" ? "text-[#0057b8]" : "text-slate-800"
                }`}
              >
                {step.title}
              </strong>
              <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
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
  const { data, loading } = useRemote(
    () => getOrFixture("/dashboard/user", userDashboard), 
    userDashboard
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full text-left"
    >
      {/* JSW Operator Header Banner */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-[#d6dfeb] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#0057b8]" />
        
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#0057b8]">
            JSW Operator Cost Workspace
          </p>
          <h2 className="text-xl font-black text-[#10233d] uppercase tracking-wide mt-0.5">
            Operational Cost Dashboard
          </h2>
        </div>

        <Badge variant="info" icon={<Sparkles className="size-3.5" />}>
          Procurement Access
        </Badge>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Your Calculations"
          value={String(data.kpis.calculations)}
          icon={<Calculator className="size-4.5 text-[#0057b8]" />}
          trend={{ value: "12% up", isPositive: true, label: "vs last month" }}
        />
        <KPICard
          title="Saved Alloy Recipes"
          value={String(data.kpis.savedAlloys)}
          icon={<Layers3 className="size-4.5 text-[#087443]" />}
          trend={{ value: "8% increase", isPositive: true, label: "catalog" }}
        />
        <KPICard
          title="Estimated Cost Run"
          value={inr(data.kpis.estimatedValue)}
          icon={<IndianRupee className="size-4.5 text-[#d63031]" />}
          trend={{ value: "Pricing locked", isPositive: true, label: "master" }}
        />
        <KPICard
          title="Recent Calculations"
          value={String(data.kpis.recentActivity)}
          icon={<TrendingUp className="size-4.5 text-[#f2994a]" />}
          trend={{ value: "Live active", isPositive: true, label: "indices" }}
        />
      </div>

      {/* Row 2: Recent Calculations Table + Workflow Stepper + Fast Actions */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.7fr]">
        
        {/* Table panel */}
        <div className="lg:col-span-2 xl:col-span-1">
          <RecentCalculationsTable rows={data.recent} />
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
              <Button 
                className="w-full h-10 shadow-sm"
                leftIcon={<Calculator className="size-4" />}
              >
                New Cost Simulation
              </Button>
              <Button 
                variant="secondary" 
                className="w-full h-10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                leftIcon={<Layers3 className="size-4" />}
              >
                Open Alloy Catalog
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 border-[#d6dfeb] text-slate-600 hover:bg-slate-50"
                leftIcon={<FileSpreadsheet className="size-4" />}
              >
                Export Cost Sheet
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 border-[#d6dfeb] text-slate-600 hover:bg-slate-50"
                leftIcon={<FileText className="size-4" />}
              >
                Download Audit Logs
              </Button>
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
            <CostBars points={data.series} />
          </div>
        </ChartContainer>

        {/* Recipe Cards List */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Alloy Recipes</CardTitle>
            <CardDescription>Active custom recipe parameters list</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {data.saved.map((alloy) => (
              <div
                key={alloy.id}
                className="rounded-xl border border-[#d6dfeb] p-3.5 bg-slate-50/50 hover:bg-white transition-all duration-200 flex flex-col justify-between shadow-sm relative group"
              >
                <div className="text-left">
                  <strong className="block text-slate-800 text-xs font-bold leading-tight">
                    {alloy.name}
                  </strong>
                  <span className="inline-block text-[8px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1.5 uppercase tracking-wider">
                    {alloy.type}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 w-full text-[10px] font-bold rounded-lg border-[#d6dfeb] text-[#56657a] hover:bg-white mt-4"
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
            {data.notices.map((notice) => (
              <div 
                key={notice.id} 
                className="rounded-xl border border-[#d6dfeb] p-3 text-xs bg-slate-50/50 hover:bg-white transition-colors duration-200 shadow-sm flex flex-col gap-1 text-left"
              >
                <strong className="font-bold text-slate-800 text-[11px] leading-tight">
                  {notice.title}
                </strong>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
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
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Alloy Name</TableHead>
                <TableHead className="text-right">Weight (kg)</TableHead>
                <TableHead className="text-right">Est. Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Calculation Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-extrabold text-slate-800">{row.batchId}</TableCell>
                  <TableCell className="font-bold text-slate-700">{row.alloy?.name ?? row.name}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-500">
                    {Number(row.totalQuantity).toLocaleString("en-IN")} kg
                  </TableCell>
                  <TableCell className="text-right font-black text-[#0057b8]">
                    {inr(row.finalCost)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge value={row.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-400">
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
