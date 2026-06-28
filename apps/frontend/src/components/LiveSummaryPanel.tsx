import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { 
  Calculator, 
  Info, 
  Receipt, 
  Trash2, 
  Scale, 
  DollarSign, 
  Layers, 
  AlertTriangle,
  CheckCircle,
  FileText,
  AlertCircle,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, inr } from "@jsw-mcms/ui";
import { StatusBadge } from "./StatusBadge";
import { useWorkspaceStore } from "../store/workspaceStore";

const CHART_COLORS = ['#1A365D', '#0057b8', '#0070f3', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export interface SummaryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  gradeMultiplier: number;
  extraPrice: number;
  baseCost: number;
  metalId: string;
  gradeId: string;
  categoryName: string;
  steelTypeName: string;
  gradeName: string;
  subGradeName: string;
  rawMaterials: any[];
  isAlloyed: boolean;
}

interface LiveSummaryPanelProps {
  items: SummaryItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onClearAll: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
  isSaving?: boolean;
}

export function LiveSummaryPanel({
  items,
  onRemove,
  onUpdateQty,
  onClearAll,
  onSaveDraft,
  onComplete,
  isSaving = false,
}: LiveSummaryPanelProps) {
  const { workflowStatus, activeCalculationId } = useWorkspaceStore();

  // Interactive rates state for live simulation
  const [processingRate, setProcessingRate] = useState<number>(2.5);
  const [logisticsRate, setLogisticsRate] = useState<number>(1.5);

  // ─── COST SHEET METRICS CALCULATIONS ───
  const subtotal = items.reduce((total, item) => total + item.baseCost, 0);
  const totalQty = items.reduce((total, item) => total + item.quantity, 0);

  // Compute interactive fees
  const processingCost = totalQty * processingRate;
  const logisticsCost = totalQty * logisticsRate;
  const additionalCharges = processingCost + logisticsCost;
  const grandTotal = subtotal + additionalCharges;

  // Material count (unique master materials selected)
  const uniqueMaterialsCount = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((item) => {
      if (item.isAlloyed && item.rawMaterials && item.rawMaterials.length > 0) {
        item.rawMaterials.forEach((rm) => {
          if (rm.rawMaterialId) ids.add(rm.rawMaterialId);
        });
      } else if (item.metalId) {
        ids.add(item.metalId);
      }
    });
    return ids.size;
  }, [items]);

  // Composition Balance status check
  const isCompositionBalanced = useMemo(() => {
    return items.every((item) => {
      if (!item.isAlloyed || !item.rawMaterials || item.rawMaterials.length === 0) return true;
      const sumPct = item.rawMaterials.reduce((sum, rm) => sum + (rm.compositionPct ?? 0), 0);
      return Math.abs(sumPct - 100) < 0.1;
    });
  }, [items]);

  // Price missing detection flag
  const isAnyPriceMissing = useMemo(() => {
    return items.some((item) => {
      if (item.unitPrice === 0 || item.baseCost === 0) return true;
      if (item.isAlloyed && item.rawMaterials) {
        // Also check nested ingredients
        return item.baseCost === 0;
      }
      return false;
    });
  }, [items]);

  // Validation warnings gatherer
  const warningsList = useMemo(() => {
    const list: string[] = [];
    items.forEach((item) => {
      if (item.unitPrice === 0 || item.baseCost === 0) {
        list.push(`Master rate not set for "${item.name}"`);
      }
      if (item.quantity <= 0) {
        list.push(`Quantity must be greater than 0 for "${item.name}"`);
      }
      if (item.isAlloyed && item.rawMaterials && item.rawMaterials.length > 0) {
        const sumPct = item.rawMaterials.reduce((sum, rm) => sum + (rm.compositionPct ?? 0), 0);
        if (Math.abs(sumPct - 100) > 0.1) {
          list.push(`Alloy composition totals ${sumPct.toFixed(1)}% (must be 100%) for "${item.name}"`);
        }
        // Duplicates check
        const counts: Record<string, number> = {};
        item.rawMaterials.forEach((rm) => {
          counts[rm.rawMaterialId] = (counts[rm.rawMaterialId] || 0) + 1;
        });
        Object.entries(counts).forEach(([rmId, count]) => {
          if (count > 1) {
            list.push(`Duplicate material ingredients configured in "${item.name}"`);
          }
        });
      }
    });
    return list;
  }, [items]);

  // ─── STATUS REGISTRY CHECKS ───
  const statusStates = useMemo(() => {
    const isDraft = workflowStatus === "Draft" || !activeCalculationId;
    const isValid = items.length > 0 && items.every((item) => item.quantity > 0);
    const isBalanced = items.length > 0 && isCompositionBalanced;
    const isPriceMissing = isAnyPriceMissing;
    const isReady = items.length > 0 && isValid && isBalanced && !isPriceMissing;
    const isSubmitted = workflowStatus === "Submitted";

    return {
      Draft: isDraft,
      Valid: isValid,
      Balanced: isBalanced,
      "Missing Price": isPriceMissing,
      "Ready to Calculate": isReady,
      Submitted: isSubmitted,
    };
  }, [items, workflowStatus, activeCalculationId, isCompositionBalanced, isAnyPriceMissing]);

  // Chart Data preparation
  const [activeChartTab, setActiveChartTab] = useState<"material" | "cost" | "qty">("material");

  const chartData = useMemo(() => {
    if (!items || items.length === 0) return [];
    return items.map((item, index) => {
      const itemCost = item.baseCost;
      const itemQty = item.quantity;
      const pctCost = subtotal > 0 ? (itemCost / subtotal) * 100 : 0;
      const pctQty = totalQty > 0 ? (itemQty / totalQty) * 100 : 0;

      return {
        id: item.id,
        name: item.name,
        costValue: itemCost,
        qtyValue: itemQty,
        costPct: Number(pctCost.toFixed(1)),
        qtyPct: Number(pctQty.toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length]
      };
    });
  }, [items, subtotal, totalQty]);

  return (
    <Card className="border-border bg-white overflow-hidden flex flex-col h-full max-h-full rounded-sm shadow-none">
      {/* Header section */}
      <CardHeader className="border-b border-border bg-slate-50 text-slate-800 py-2.5 px-4 flex flex-col gap-0 shrink-0 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#1A365D]" />
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-650 flex items-center gap-1.5">
              Live Cost Sheet
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[8px] py-0 px-1 font-extrabold">
                <span className="relative flex h-1.5 w-1.5 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Active Summary
              </Badge>
            </CardTitle>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Clear all summary items"
              className="h-6 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm text-[9px] font-black uppercase transition-all duration-150"
              onClick={onClearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden gap-3.5">
        
        {/* Core Metrics High Density Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50/50 border border-[#d6dfeb]/60 rounded-sm p-2 text-left select-none">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Materials</span>
            <span className="text-xs font-black text-slate-800 mt-0.5">{uniqueMaterialsCount} Types</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Weight</span>
            <span className="text-xs font-black text-slate-800 mt-0.5 font-mono">{totalQty.toLocaleString("en-IN")} kg</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Composition</span>
            <span className={`text-xs font-black mt-0.5 ${isCompositionBalanced ? "text-emerald-700" : "text-amber-700 animate-pulse"}`}>
              {isCompositionBalanced ? "Balanced" : "Unbalanced"}
            </span>
          </div>
        </div>

        {/* Selected Sheets List */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0 select-none">
            Active Workspace Items ({items.length})
          </span>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-sm py-6 px-4 text-center bg-slate-50/50">
              <Calculator className="h-6 w-6 text-slate-350 mb-2" />
              <strong className="text-slate-600 text-xs font-semibold block mb-1">
                Workspace Empty
              </strong>
              <p className="text-[10px] text-slate-450 font-medium max-w-[200px] leading-relaxed">
                Add metal alloy sheets or custom material listings to build cost summary simulation.
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin pb-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-2.5 border border-slate-200 rounded-sm bg-white hover:border-slate-300 transition-colors duration-150 relative text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#1A365D] leading-tight">
                      {idx + 1}. {item.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${item.name}`}
                      className="h-5 w-5 p-0 rounded-sm text-slate-300 hover:text-red-600 hover:bg-red-50 shrink-0 transition-colors"
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Quantity & Pricing grid */}
                  <div className="grid grid-cols-3 gap-2 items-center text-[10px] mt-2">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Quantity (kg)</span>
                      <Input
                        type="number"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => onUpdateQty(item.id, Math.max(0, Number(e.target.value)))}
                        aria-label={`Quantity for ${item.name}`}
                        className="h-7 text-xs font-extrabold py-0.5 px-1.5 w-full rounded-sm bg-white border border-slate-200 font-mono"
                      />
                    </div>

                    <div className="text-right">
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Price/kg</span>
                      {item.unitPrice === 0 ? (
                        <div className="inline-flex mt-1 text-[8px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.5 rounded-sm">
                          No Rate
                        </div>
                      ) : (
                        <strong className="text-slate-700 block mt-1 font-mono text-[11px]">{inr(item.unitPrice)}</strong>
                      )}
                    </div>

                    <div className="text-right font-bold">
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Subtotal</span>
                      {item.baseCost === 0 ? (
                        <div className="inline-flex mt-1 text-[8px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.5 rounded-sm">
                          Price Missing
                        </div>
                      ) : (
                        <strong className="text-[#1A365D] font-black block mt-1 font-mono text-[11px]">{inr(item.baseCost)}</strong>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Warnings Panel */}
        {warningsList.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-200 rounded-sm p-2 text-left shrink-0 max-h-20 overflow-y-auto scrollbar-thin">
            <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Validation Warnings</span>
            <div className="flex flex-col gap-1 text-[10px] text-amber-700 font-semibold">
              {warningsList.map((warn, i) => (
                <div key={i} className="flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Validation Status Registry */}
        <div className="border-t border-slate-100 pt-2 shrink-0 text-left select-none">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Validation Status Registry
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(statusStates).map(([label, active]) => (
              <div 
                key={label}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border transition-all duration-200 ${
                  active 
                    ? label === "Missing Price"
                      ? "border-rose-200 bg-rose-50 text-rose-700 font-bold"
                      : "border-emerald-250 bg-emerald-50 text-emerald-800 font-bold"
                    : "border-slate-200 bg-slate-50/50 text-slate-400"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  active 
                    ? label === "Missing Price" 
                      ? "bg-rose-500" 
                      : "bg-emerald-500" 
                    : "bg-slate-300"
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-wide truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* upgraded Donut Chart / Visualization tabs */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 pt-2 shrink-0">
            <div
              role="tablist"
              aria-label="Distribution views"
              className="flex border-b border-slate-150 pb-1 mb-2 gap-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none"
            >
              {(["material", "cost", "qty"] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeChartTab === tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`pb-0.5 cursor-pointer transition-all duration-200 ${
                    activeChartTab === tab
                      ? "border-b-2 border-[#1A365D] text-[#1A365D] font-extrabold"
                      : "hover:text-slate-600"
                  }`}
                >
                  {tab === "material" ? "Material Contribution %" : tab === "cost" ? "Cost Share %" : "Qty Scale"}
                </button>
              ))}
            </div>

            <div className="h-24 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-sm p-1 relative">
              {activeChartTab === "material" && (
                <div className="flex items-center w-full h-full gap-2 relative">
                  <div className="w-[45%] h-20 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={16}
                          outerRadius={30}
                          paddingAngle={1.5}
                          dataKey="qtyValue"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '3px', border: '1px solid #e2e8f0', fontSize: '9px', padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                          formatter={(value: any, name: any) => [`${value} kg`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Weight</span>
                      <span className="text-[10px] font-extrabold font-mono text-slate-800 mt-0.5">
                        {totalQty.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-[55%] flex flex-col justify-center gap-0.5 overflow-y-auto max-h-20 pr-1 text-[9px] font-semibold text-slate-500">
                    {chartData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate pr-1">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-700 shrink-0 font-mono">{item.qtyPct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeChartTab === "cost" && (
                <div className="flex items-center w-full h-full gap-2 relative">
                  <div className="w-[45%] h-20 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={16}
                          outerRadius={30}
                          paddingAngle={1.5}
                          dataKey="costValue"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '3px', border: '1px solid #e2e8f0', fontSize: '9px', padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                          formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString()}`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Cost</span>
                      <span className="text-[10px] font-extrabold font-mono text-[#1A365D] mt-0.5">
                        ₹{(subtotal / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-[55%] flex flex-col justify-center gap-0.5 overflow-y-auto max-h-20 pr-1 text-[9px] font-semibold text-slate-500">
                    {chartData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate pr-1">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-700 shrink-0 font-mono">{item.costPct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeChartTab === "qty" && (
                <div className="w-full h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 2, right: 10, left: -25, bottom: 2 }}
                    >
                      <XAxis type="number" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" fontSize={8} width={40} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '3px', border: '1px solid #e2e8f0', fontSize: '9px', padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                        formatter={(value: any) => [`${value} kg`, "Quantity"]}
                      />
                      <Bar dataKey="qtyValue" radius={[0, 2, 2, 0]} maxBarSize={8}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interactive Billing Adjustments */}
        {items.length > 0 && (
          <div className="border-t border-slate-150 pt-3 shrink-0 text-left select-none">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billing Adjustments (Interactive)
            </span>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Processing (₹/kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={processingRate}
                  onChange={(e) => setProcessingRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-7 text-xs font-black font-mono border-slate-200 focus:ring-[#1A365D]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Logistics (₹/kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={logisticsRate}
                  onChange={(e) => setLogisticsRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-7 text-xs font-black font-mono border-slate-200 focus:ring-[#1A365D]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Billing Totals */}
        <div className="space-y-3 pt-3 border-t border-slate-200 shrink-0 select-none">
          <div className="space-y-1 text-[11px] text-left">
            <div className="flex justify-between items-center text-slate-500 font-semibold">
              <span>Raw Material Cost</span>
              {isAnyPriceMissing ? (
                <Badge variant="danger" className="text-[8px] font-extrabold tracking-wide px-1.5 py-0.5 rounded-sm">
                  Price Missing
                </Badge>
              ) : (
                <span className="font-extrabold text-slate-700 font-mono">{inr(subtotal)}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-slate-400 font-medium">
              <span>Processing Cost</span>
              <span className="text-slate-550 font-mono font-semibold">{inr(processingCost)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-medium">
              <span>Logistics Cost</span>
              <span className="text-slate-550 font-mono font-semibold">{inr(logisticsCost)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 font-semibold pb-2 border-b border-slate-100 mt-1">
              <span>Additional Charges Total</span>
              <span className="text-slate-650 font-mono font-bold">{inr(additionalCharges)}</span>
            </div>
          </div>

          {/* Flat JSW Steel Enterprise total box */}
          <div className="rounded-sm bg-[#1A365D] px-4 py-3 text-white flex flex-col gap-2 relative overflow-hidden border border-[#122543]">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-blue-200">
              <span>Total Estimated Cost</span>
              <StatusBadge status={isSaving ? "Calculating" : (workflowStatus === "Ready" ? "Saved" : (workflowStatus === "Submitted" ? "Submitted" : "Draft"))} />
            </div>

            <div className="flex items-baseline justify-between">
              <strong className="text-xl font-black tracking-tight font-mono text-white">
                {isAnyPriceMissing ? "Cost Pending" : inr(grandTotal)}
              </strong>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-blue-200/80 border-t border-blue-800/60 pt-2">
              <Info className="h-3 w-3 shrink-0" />
              <span>Includes master rates, grade multipliers, and billing adjustments.</span>
            </div>
          </div>

          {/* Sidebar CTA operations */}
          <div className="grid grid-cols-2 gap-2 mt-2 select-none">
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving || items.length === 0}
              className="h-8 rounded-sm text-slate-600 border-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50"
              onClick={onSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving || items.length === 0 || isAnyPriceMissing || !isCompositionBalanced}
              className="h-8 rounded-sm bg-[#1A365D] hover:bg-[#122543] text-white font-bold uppercase tracking-wider text-[10px]"
              onClick={onComplete}
            >
              Submit Run
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
