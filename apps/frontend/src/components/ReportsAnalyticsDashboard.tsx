/**
 * ReportsAnalyticsDashboard
 * Five-panel analytics section for the Reports page.
 * Uses Recharts + mock-data fallback.
 */
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const JSW_BLUE   = "#005BAC";
const JSW_DARK   = "#002652";
const COLORS = [JSW_BLUE, "#2d7dd2", "#4a9fd4", "#7ab8e0", "#a8d1f0"];
const MATERIAL_COLORS = [JSW_BLUE, "#0e7a3c", "#7c3aed", "#b45309", "#dc2626"];

interface AnalyticsProps {
  calculations: any[];
  activityData: any[];
  isLoading?: boolean;
}

const fmtINR = (v: number) =>
  v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr`
  : v >= 100000 ? `₹${(v/100000).toFixed(1)}L`
  : `₹${v.toLocaleString("en-IN")}`;

function SectionLabel({ icon: Icon, title, subtitle, badge }: { icon: any; title: string; subtitle: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9]">
      <div>
        <h3 className="text-xs font-bold text-slate-800 tracking-tight">{title}</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-[#f8fafc] border border-[#e5e7eb] rounded px-2 py-1">
        <Icon className="size-3" /> {badge ?? title}
      </span>
    </div>
  );
}

function ChartEmpty({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
      <Icon className="size-8" />
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-full w-full rounded bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />;
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1b2a] text-white rounded px-3 py-2 text-[10px] font-semibold shadow-sm">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="text-[#60aef0]">Cost: {fmtINR(payload[0]?.value)}</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1b2a] text-white rounded px-3 py-2 text-[10px] font-semibold shadow-sm">
      <p className="text-slate-300 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmtINR(p.value)}</p>
      ))}
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1b2a] text-white rounded px-3 py-2 text-[10px] font-semibold shadow-sm">
      <p className="text-slate-300">{payload[0]?.name}</p>
      <p className="text-[#60aef0]">{payload[0]?.value.toLocaleString("en-IN")} kg</p>
    </div>
  );
}

export function ReportsAnalyticsDashboard({ calculations, activityData, isLoading = false }: AnalyticsProps) {

  // 1. Cost Trend
  const trendData = (() => {
    const grouped: Record<string, { cost: number; volume: number; ts: number }> = {};
    calculations.forEach((r: any) => {
      const d = new Date(r.createdAt);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!grouped[key]) grouped[key] = { cost: 0, volume: 0, ts: d.getTime() };
      grouped[key].cost   += Number(r.finalCost || 0);
      grouped[key].volume += Number(r.totalQuantity || 0);
    });
    const real = Object.entries(grouped)
      .sort((a, b) => a[1].ts - b[1].ts)
      .map(([date, v]) => ({ date, cost: v.cost, volume: v.volume }));
    return real.slice(-14);
  })();

  // 2. Monthly Cost
  const monthlyChartData = (() => {
    const grouped: Record<string, { cost: number; order: number }> = {};
    calculations.forEach((r: any) => {
      const d   = new Date(r.createdAt);
      const key = d.toLocaleString("default", { month: "short" });
      const ord = d.getFullYear() * 100 + d.getMonth();
      if (!grouped[key]) grouped[key] = { cost: 0, order: ord };
      grouped[key].cost += Number(r.finalCost || 0);
    });
    const real = Object.entries(grouped)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([month, v]) => ({ month, cost: v.cost }));
    return real.slice(-6);
  })();

  // 3. Material Usage
  const materialData = (() => {
    const grouped: Record<string, number> = {};
    calculations.forEach((r: any) => {
      const mode = String(r.mode || "Unknown");
      grouped[mode] = (grouped[mode] || 0) + Number(r.totalQuantity || 0);
    });
    const nameMap: Record<string, string> = { metal: "Metal Mode", alloy: "Alloy Mode", "raw-material": "Raw Material" };
    const real = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name: nameMap[name] ?? name, value }));
    return real;
  })();
  const materialTotal = materialData.reduce((s, x) => s + x.value, 0);

  // 4. Top Grades
  const gradesData = (() => {
    const grouped: Record<string, { cost: number; runs: number }> = {};
    calculations.forEach((r: any) => {
      const g = r.name || "Unknown";
      if (!grouped[g]) grouped[g] = { cost: 0, runs: 0 };
      grouped[g].cost += Number(r.finalCost || 0);
      grouped[g].runs++;
    });
    const real = Object.entries(grouped)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 5)
      .map(([grade, v]) => ({
        grade: grade.length > 18 ? grade.slice(0, 17) + "\u2026" : grade,
        cost: v.cost,
        runs: v.runs,
      }));
    return real;
  })();

  // 5. Recent Activity
  const activityList = (() => {
    const real = activityData.slice(0, 8).map((r: any) => ({
      material: r.rawMaterial?.name || r.metal?.name || "\u2014",
      oldPrice: Number(r.oldPrice || 0),
      newPrice: Number(r.newPrice || 0),
      operator: r.updatedBy?.name || "System",
      ts: new Date(r.updatedAt || r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    }));
    return real;
  })();

  return (
    <div className="flex flex-col gap-3">

      {/* Row 1: Trend + Monthly */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-3">

        {/* Chart 1 — Cost Trend */}
        <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
          <SectionLabel icon={TrendingUp} title="Cost Trend" subtitle="Final cost over time — daily granularity" badge="Area Line" />
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-48"><ChartSkeleton /></div>
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <AreaChart accessibilityLayer aria-label="Area Chart" data={trendData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rptCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={JSW_BLUE} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={JSW_BLUE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtINR} width={52} />
                  <RechartTooltip content={<TrendTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="cost" stroke={JSW_BLUE} strokeWidth={2} fill="url(#rptCostGrad)" dot={false} activeDot={{ r: 4, fill: JSW_BLUE, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 2 — Monthly Cost Bar */}
        <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
          <SectionLabel icon={BarChart3} title="Monthly Cost Breakdown" subtitle="Gross vs. GST vs. Net — last 6 months" badge="Bar" />
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-48"><ChartSkeleton /></div>
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <BarChart accessibilityLayer aria-label="Bar Chart" data={monthlyChartData} barCategoryGap="28%" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtINR} width={44} />
                  <RechartTooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,91,172,0.04)" }} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 9, paddingTop: 8 }} />
                  <Bar dataKey="cost" name="Cost" fill={JSW_BLUE} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Row 2: Donut + Grades + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

        {/* Chart 3 — Material Usage Donut */}
        <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
          <SectionLabel icon={PieChartIcon} title="Material Usage Mix" subtitle="Volume share by calculation mode (kg)" badge="Donut" />
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-44"><ChartSkeleton /></div>
            ) : (
              <div className="flex flex-col gap-3">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart accessibilityLayer aria-label="Pie Chart">
                    <Pie data={materialData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {materialData.map((_, i) => (
                        <Cell key={i} fill={MATERIAL_COLORS[i % MATERIAL_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5">
                  {materialData.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-sm shrink-0" style={{ background: MATERIAL_COLORS[i % MATERIAL_COLORS.length] }} />
                        <span className="text-[10px] font-medium text-slate-600 truncate max-w-[120px]">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{m.value.toLocaleString("en-IN")} kg</span>
                        <span
                          className="text-[9px] font-bold px-1 py-0.5 rounded"
                          style={{ background: `${MATERIAL_COLORS[i % MATERIAL_COLORS.length]}18`, color: MATERIAL_COLORS[i % MATERIAL_COLORS.length] }}
                        >
                          {materialTotal > 0 ? ((m.value / materialTotal) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 4 — Top Grades */}
        <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
          <SectionLabel icon={BarChart3} title="Top Grades by Cost" subtitle="Highest final cost grades across all runs" badge="Ranked" />
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-44"><ChartSkeleton /></div>
            ) : (
              <div className="flex flex-col gap-3">
                {gradesData.map((g, i) => {
                  const maxCost = gradesData[0].cost;
                  const pct = maxCost > 0 ? (g.cost / maxCost) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: i === 0 ? JSW_BLUE : "#f1f5f9", color: i === 0 ? "#fff" : "#64748b" }}
                          >{i + 1}</span>
                          <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[130px]">{g.grade}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-slate-400">{g.runs} runs</span>
                          <span className="text-[10px] font-bold text-[#005BAC]">{fmtINR(g.cost)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: i === 0 ? `linear-gradient(to right, ${JSW_DARK}, ${JSW_BLUE})` : COLORS[i] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 5 — Recent Activity Timeline */}
        <Card className="rounded border border-[#e5e7eb] bg-white shadow-none">
          <SectionLabel icon={Activity} title="Recent Price Activity" subtitle="Latest material rate changes" badge="Timeline" />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-44 p-4"><ChartSkeleton /></div>
            ) : (
              <div className="divide-y divide-[#f8fafc]">
                {activityList.map((a, i) => {
                  const delta = a.newPrice - a.oldPrice;
                  const pct   = a.oldPrice > 0 ? ((delta / a.oldPrice) * 100).toFixed(1) : "0.0";
                  const up    = delta > 0;
                  const flat  = delta === 0;
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafcff] transition-colors">
                      <div className="grid size-7 place-items-center rounded shrink-0" style={{ background: flat ? "#f1f5f9" : up ? "#edfaf3" : "#fef2f2" }}>
                        {flat ? <Minus className="size-3 text-slate-400" /> : up ? <ArrowUpRight className="size-3 text-emerald-600" /> : <ArrowDownRight className="size-3 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{a.material}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 font-mono">{a.oldPrice > 0 ? `\u20b9${a.oldPrice.toLocaleString("en-IN")}` : "—"}</span>
                          <span className="text-[9px] text-slate-300">\u2192</span>
                          <span className="text-[9px] font-bold text-slate-700 font-mono">{a.newPrice > 0 ? `\u20b9${a.newPrice.toLocaleString("en-IN")}` : "—"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: flat ? "#f1f5f9" : up ? "#edfaf3" : "#fef2f2", color: flat ? "#94a3b8" : up ? "#0e7a3c" : "#dc2626" }}
                        >
                          {flat ? "\u2014" : `${up ? "+" : ""}${pct}%`}
                        </span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="size-2.5" />{a.ts}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
