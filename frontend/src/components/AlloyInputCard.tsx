import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Layers, Lock, Plus, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RawMaterialTable } from "./RawMaterialTable";
import { inr } from "@/utils";
import type { Grade, Metal, RawMaterial } from "@/types";

export interface RawMaterialItem {
  id: string;
  rawMaterialId: string;
  quantity: number;
}

export interface MetalCardState {
  id: string;
  metalId: string;
  gradeId: string;
  quantity: number;
  rawMaterials: RawMaterialItem[];
  isExpanded: boolean;
}

interface AlloyInputCardProps {
  index: number;
  card: MetalCardState;
  metalsList: Metal[];
  gradesList: Grade[];
  rawMaterialsList: RawMaterial[];
  onUpdate: (updated: MetalCardState) => void;
  onRemove: () => void;
  onAddToSummary: () => void;
}

export function AlloyInputCard({
  index,
  card,
  metalsList,
  gradesList,
  rawMaterialsList,
  onUpdate,
  onRemove,
  onAddToSummary,
}: AlloyInputCardProps) {
  const currentMetal = metalsList.find((m) => m.id === card.metalId) || metalsList[0];
  const availableGrades = gradesList.filter((g) => g.metalId === card.metalId);
  const currentGrade = gradesList.find((g) => g.id === card.gradeId) || availableGrades[0] || gradesList[0];

  // Base price per unit from master
  const basePricePerUnit = Number(currentMetal?.prices?.[0]?.pricePerUnit ?? 0);
  
  // Calculate Standard cost (multiplier and extra price applied)
  const gradeMultiplier = Number(currentGrade?.multiplier ?? 1);
  const extraPrice = Number(currentGrade?.extraPrice ?? 0);
  const standardUnitPrice = basePricePerUnit * gradeMultiplier + extraPrice;
  const standardTotalCost = card.quantity * standardUnitPrice;

  // Calculate Raw Materials cost
  const rawMaterialsTotalCost = card.rawMaterials.reduce((total, item) => {
    const raw = rawMaterialsList.find((rm) => rm.id === item.rawMaterialId);
    const rawPrice = Number(raw?.prices?.[0]?.pricePerUnit ?? 0);
    return total + (item.quantity * rawPrice);
  }, 0);

  const rawMaterialsTotalQty = card.rawMaterials.reduce((total, item) => total + item.quantity, 0);

  // Check if we should override using raw materials
  const usesRawMaterials = card.rawMaterials.length > 0;
  const computedTotalCost = usesRawMaterials ? rawMaterialsTotalCost : standardTotalCost;
  const computedUnitPrice = card.quantity > 0 ? (computedTotalCost / card.quantity) : (usesRawMaterials ? 0 : standardUnitPrice);

  const handleMetalChange = (metalId: string) => {
    const nextGrades = gradesList.filter((g) => g.metalId === metalId);
    onUpdate({
      ...card,
      metalId,
      gradeId: nextGrades[0]?.id || "",
    });
  };

  const handleGradeChange = (gradeId: string) => {
    onUpdate({
      ...card,
      gradeId,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    onUpdate({
      ...card,
      quantity: Math.max(0, quantity),
    });
  };

  const toggleExpand = () => {
    onUpdate({
      ...card,
      isExpanded: !card.isExpanded,
    });
  };

  const handleUpdateRawMaterials = (rawMaterials: RawMaterialItem[]) => {
    onUpdate({
      ...card,
      rawMaterials,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md">
        {/* Sleek Blue Border Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />

        <CardContent className="p-5 pt-6">
          {/* Card Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {index + 1}
              </span>
              <h3 className="font-bold text-slate-800 tracking-tight">
                {currentMetal?.name || "Select Metal"} Calc Card
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-500"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          </div>

          {/* Primary Inputs Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Metal / Alloy
              </label>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 transition-colors focus:border-blue-400 focus:outline-none"
                value={card.metalId}
                onChange={(e) => handleMetalChange(e.target.value)}
              >
                {metalsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grade
              </label>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 transition-colors focus:border-blue-400 focus:outline-none"
                value={card.gradeId}
                onChange={(e) => handleGradeChange(e.target.value)}
              >
                {availableGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quantity (kg)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  className="h-10 w-full rounded-xl pr-8 text-sm font-semibold"
                  value={card.quantity === 0 ? "" : card.quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Price / kg</span>
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold lowercase bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <Lock className="h-2.5 w-2.5" /> master
                </span>
              </label>
              <div className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-700">
                <span>{inr(computedUnitPrice)}</span>
                {usesRawMaterials && (
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                    Alloyed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Composition Information */}
          {usesRawMaterials && (
            <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-slate-50/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-600">Alloy Composition Recipe</span>
                </div>
                <div className="text-slate-500 font-semibold">
                  Raw Quantities Total: <strong className="text-slate-800">{rawMaterialsTotalQty.toLocaleString()} kg</strong>
                </div>
              </div>
              
              {/* Dynamic Percentages Visual Bar */}
              <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                {card.rawMaterials.map((item, idx) => {
                  const raw = rawMaterialsList.find((r) => r.id === item.rawMaterialId);
                  const pct = rawMaterialsTotalQty > 0 ? (item.quantity / rawMaterialsTotalQty) * 100 : 0;
                  const bgColors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-teal-500", "bg-amber-500"];
                  const bgClass = bgColors[idx % bgColors.length];
                  
                  if (pct === 0) return null;
                  
                  return (
                    <div
                      key={item.id}
                      className={`${bgClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                      title={`${raw?.name || "Material"}: ${pct.toFixed(1)}%`}
                    />
                  );
                })}
              </div>

              {/* Badges Legend */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {card.rawMaterials.map((item, idx) => {
                  const raw = rawMaterialsList.find((r) => r.id === item.rawMaterialId);
                  const pct = rawMaterialsTotalQty > 0 ? (item.quantity / rawMaterialsTotalQty) * 100 : 0;
                  const dotColors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-teal-500", "bg-amber-500"];
                  const dotColor = dotColors[idx % dotColors.length];
                  return (
                    <div key={item.id} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-100 text-[10px] font-semibold text-slate-600 shadow-sm">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                      <span>{raw?.name}: {pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row & Accordion Trigger */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              onClick={toggleExpand}
            >
              {card.isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                  <span>Collapse Recipe</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                  <span>Expand Raw Materials ({card.rawMaterials.length})</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              {usesRawMaterials && (
                <div className="text-right mr-1.5 hidden sm:block">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Computed Cost
                  </span>
                  <strong className="text-sm font-extrabold text-indigo-600">
                    {inr(computedTotalCost)}
                  </strong>
                </div>
              )}

              <Button
                size="sm"
                className="h-9 gap-1 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-sm"
                onClick={onAddToSummary}
              >
                <span>Add to Summary</span>
                <TrendingUp className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Expandable Recipe Section */}
          <AnimatePresence initial={false}>
            {card.isExpanded && (
              <motion.div
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { height: "auto", opacity: 1, marginTop: 16 },
                  collapsed: { height: 0, opacity: 0, marginTop: 0 },
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Plus className="h-3 w-3 text-slate-400" /> Alloy Composition Table
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Raw materials belong only to this alloy card and are excluded from summary sheet.
                    </p>
                  </div>

                  <RawMaterialTable
                    rawMaterials={card.rawMaterials}
                    rawMaterialsList={rawMaterialsList}
                    onUpdate={handleUpdateRawMaterials}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
