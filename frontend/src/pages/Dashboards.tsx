import { Calculator, FileSpreadsheet, IndianRupee, Layers3, PackagePlus, TrendingUp, Users, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalculationLine, DoughnutMetric } from "@/components/Charts";
import { Skeleton } from "@/components/ui/skeleton";
import { adminDashboard, userDashboard } from "@/data/fixtures";
import { useAuth } from "@/store/auth";
import { useRemote } from "@/hooks/useRemote";
import { inr, shortDate } from "@/utils";
import { getOrFixture } from "@/services/api";
import type { Calculation } from "@/types";

// Reusable components
import { KPIWidget } from "@/components/KPIWidget";
import { DashboardCard } from "@/components/DashboardCard";

function Status({ value }: { value: string }) {
  return (
    <Badge
      className={
        value === "COMPLETED"
          ? "border-[#bde4cf] bg-[#e8fbf0] text-[#087443] font-bold"
          : "border-[#f3daa5] bg-[#fff6e4] text-[#8a5900] font-bold"
      }
    >
      {value}
    </Badge>
  );
}

export function DashboardPage() {
  const { actor } = useAuth();
  return actor?.role === "ADMIN" ? <AdminDashboard /> : <UserDashboard />;
}

function AdminDashboard() {
  const { data, loading } = useRemote(() => getOrFixture("/dashboard/admin", adminDashboard), adminDashboard);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      {/* Redesigned Dashboard Banner Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600" />
        
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            JSW Production Control Hub
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5 animate-pulse">
            System Control Dashboard
          </h2>
        </div>

        <Badge className="border-[#bfd6f5] bg-[#edf5ff] text-[#063d83] font-bold px-3 py-1 text-xs rounded-full">
          Admin Executive Level
        </Badge>
      </header>

      {/* High-density KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }, (_, idx) => <Skeleton key={idx} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <KPIWidget
              label="Calculations Saved"
              value={data.kpis.calculations.toLocaleString("en-IN")}
              icon={Calculator}
              trend="↑ 18.6% this month"
              trendType="up"
              color="blue"
            />
            <KPIWidget
              label="Controlled Access Users"
              value={String(data.kpis.activeUsers)}
              icon={Users}
              trend="Online & active"
              trendType="neutral"
              color="indigo"
            />
            <KPIWidget
              label="Configured Alloys"
              value={String(data.kpis.alloys)}
              icon={Layers3}
              trend="↑ 12% recipe lists"
              trendType="up"
              color="emerald"
            />
            <KPIWidget
              label="Raw Ingredients"
              value={String(data.kpis.rawMaterials)}
              icon={PackagePlus}
              trend="Master prices locked"
              trendType="neutral"
              color="amber"
            />
            <KPIWidget
              label="Est. Billing Volume"
              value={inr(data.kpis.estimatedValue)}
              icon={IndianRupee}
              trend="↑ 4.2% demand"
              trendType="up"
              color="rose"
            />
          </>
        )}
      </div>

      {/* Main Graphs & Actions */}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.8fr]">
        <DashboardCard
          title="Calculations Cost Value Trends"
          description="Live calculation cost indices updated by price masters"
          loading={loading}
        >
          <div className="h-[280px]">
            <CalculationLine points={data.series} />
          </div>
        </DashboardCard>

        <DashboardCard
          title="Operational Quick Actions"
          description="Procurement workflow actions trigger points"
          loading={loading}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 my-auto">
            <Button className="h-10 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5">
              <Calculator className="h-4 w-4" />
              <span>Run Calculation</span>
            </Button>
            <Button variant="secondary" className="h-10 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
              Add Alloy Recipe
            </Button>
            <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
              Add Metal Grade
            </Button>
            <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
              Master Price Update
            </Button>
          </div>
        </DashboardCard>
      </div>

      {/* Composition Analysis Row */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="Alloy Category Distribution" description="Top active JSW metal recipes composition">
          <div className="h-[240px] flex items-center justify-center">
            <DoughnutMetric rows={data.topAlloys} center={String(data.kpis.alloys)} />
          </div>
        </DashboardCard>

        <DashboardCard title="System Batch Run Success" description="Completed vs draft calculations distribution">
          <div className="h-[240px] flex items-center justify-center">
            <DoughnutMetric rows={data.statuses} center={String(data.kpis.calculations)} />
          </div>
        </DashboardCard>

        <DashboardCard title="Security & Calculation Logs" description="Recent master audit actions logged">
          <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
            {data.activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2.5 rounded-xl border border-slate-150 p-3 text-xs bg-slate-50 hover:bg-white transition-colors shadow-sm"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-extrabold text-slate-800">
                    {entry.entity} updated
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {entry.action.replace("_", " ")} by {entry.user?.name ?? "System Operator"}
                  </p>
                  <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-1">
                    {shortDate(entry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Recent Calculations Table & System Summary */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <RecentTable rows={data.recent} />
        
        <DashboardCard title="Internal Auditing Alerts" description="Active price slab notifications">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(data.systemSummary).map(([name, value]) => (
              <div key={name} className="rounded-xl border border-slate-150 bg-[#fafcff] p-3 text-xs flex flex-col gap-0.5 shadow-sm">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  {name.replace(/([A-Z])/g, " $1")}
                </span>
                <strong className="text-xl font-black text-slate-700">{value}</strong>
              </div>
            ))}
            
            {data.notices.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                className="col-span-2 rounded-xl border border-rose-150 bg-rose-50/50 p-3 text-xs font-semibold text-rose-700 flex items-start gap-2"
              >
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-rose-500 animate-pulse" />
                <div>
                  <span className="block font-bold text-rose-800">{notice.title}</span>
                  <span className="text-[10px] text-rose-600 leading-relaxed font-medium">{notice.message}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  );
}

function UserDashboard() {
  const { data } = useRemote(() => getOrFixture("/dashboard/user", userDashboard), userDashboard);
  return (
    <div className="flex flex-col gap-6">
      {/* Redesigned User Dashboard Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600" />
        
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            JSW Operator cost workspace
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            Operational Cost Dashboard
          </h2>
        </div>

        <Badge className="border-[#bfd6f5] bg-[#edf5ff] text-[#063d83] font-bold px-3 py-1 text-xs rounded-full">
          Procurement Access
        </Badge>
      </header>

      {/* KPI Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget
          label="Your Calculations"
          value={String(data.kpis.calculations)}
          icon={Calculator}
          trend="↑ 12% vs last month"
          trendType="up"
          color="blue"
        />
        <KPIWidget
          label="Saved Alloy Recipes"
          value={String(data.kpis.savedAlloys)}
          icon={Layers3}
          trend="↑ 8% catalog increase"
          trendType="up"
          color="indigo"
        />
        <KPIWidget
          label="Estimated Cost Run"
          value={inr(data.kpis.estimatedValue)}
          icon={IndianRupee}
          trend="Pricing locks applied"
          trendType="neutral"
          color="emerald"
        />
        <KPIWidget
          label="Recent Calculations Logged"
          value={String(data.kpis.recentActivity)}
          icon={TrendingUp}
          trend="Live cost updates active"
          trendType="up"
          color="amber"
        />
      </div>

      {/* Actions and Calculations Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
        <RecentTable rows={data.recent} />
        
        <DashboardCard title="Operator Actions" description="Fast simulation actions">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 my-auto">
            <Button className="h-10 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5">
              <Calculator className="h-4 w-4" />
              <span>New Cost Simulation</span>
            </Button>
            <Button variant="secondary" className="h-10 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
              Open Alloy Catalog
            </Button>
            <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Cost Sheet</span>
            </Button>
            <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
              Download Audit Logs
            </Button>
          </div>
        </DashboardCard>
      </div>

      {/* Additional Visuals Section */}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.15fr_0.8fr]">
        <DashboardCard title="Estimation Cost Curves" description="Running seven-day indices tracker">
          <div className="h-[240px]">
            <CalculationLine points={data.series} />
          </div>
        </DashboardCard>

        <DashboardCard title="Saved Alloy Recipes" description="Active custom recipe parameters list">
          <div className="grid gap-3 sm:grid-cols-2 overflow-y-auto max-h-[240px] pr-1 scrollbar-thin">
            {data.saved.map((alloy) => (
              <div
                key={alloy.id}
                className="rounded-xl border border-slate-150 p-3.5 bg-slate-50 hover:bg-white transition-colors duration-200 flex flex-col justify-between shadow-sm relative group"
              >
                <div>
                  <strong className="block text-xs font-black text-slate-800">{alloy.name}</strong>
                  <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-150 px-2 py-0.5 rounded mt-1 uppercase">
                    {alloy.type}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="h-7 w-full text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 mt-4">
                  Open Recipe Calc
                </Button>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Cost Alerts & Notices" description="Dynamic price list events catalog">
          <div className="space-y-3 overflow-y-auto max-h-[240px] pr-1 scrollbar-thin">
            {data.notices.map((notice) => (
              <div key={notice.id} className="rounded-xl border border-slate-150 p-3 text-xs bg-slate-50 hover:bg-white transition-colors shadow-sm flex flex-col gap-1">
                <strong className="font-extrabold text-slate-800 text-[11px]">{notice.title}</strong>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{notice.message}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function RecentTable({ rows }: { rows: Calculation[] }) {
  return (
    <DashboardCard title="Recent Batch Calculations" description="Live simulation runs saved by procurement">
      <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
        <Table className="w-full text-xs">
          <TableHeader className="bg-slate-50">
            <TableRow className="border-b border-slate-150">
              <TableHead className="h-10 font-bold text-slate-600">Batch Code</TableHead>
              <TableHead className="h-10 font-bold text-slate-600">Alloy Name</TableHead>
              <TableHead className="h-10 font-bold text-slate-600 text-right">Weight (kg)</TableHead>
              <TableHead className="h-10 font-bold text-slate-600 text-right">Est. Price</TableHead>
              <TableHead className="h-10 font-bold text-slate-600 text-center">Status</TableHead>
              <TableHead className="h-10 font-bold text-slate-600 text-right">Calculation Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <TableCell className="py-2.5 font-extrabold text-slate-800">{row.batchId}</TableCell>
                <TableCell className="py-2.5 font-bold text-slate-700">{row.alloy?.name ?? row.name}</TableCell>
                <TableCell className="py-2.5 text-right font-semibold text-slate-500">
                  {Number(row.totalQuantity).toLocaleString("en-IN")} kg
                </TableCell>
                <TableCell className="py-2.5 text-right font-black text-blue-600">
                  {inr(row.finalCost)}
                </TableCell>
                <TableCell className="py-2.5 text-center">
                  <Status value={row.status} />
                </TableCell>
                <TableCell className="py-2.5 text-right font-semibold text-slate-400">
                  {shortDate(row.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardCard>
  );
}
