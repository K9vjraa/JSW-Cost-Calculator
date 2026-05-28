import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Layers, Lock, Plus, Trash2, TrendingUp } from "lucide-react";
import { useMemo } from "react";

// Shared design system components
import { 
  Card, 
  CardContent, 
  Input, 
  Select, 
  Badge, 
  Button, 
  inr 
} from "@jsw-mcms/ui";

import { RawMaterialTable } from "./RawMaterialTable";
import type { RawMaterialItem } from "./RawMaterialTable";
import type { Grade, Metal, RawMaterial } from "@/types";

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

  // Dynamically map composition percentages for existing seed raw materials on card load
  const mappedRawMaterials = useMemo(() => {
    return card.rawMaterials.map((item) => {
      if (item.compositionPct !== undefined) return item;
      const pct = card.quantity > 0 ? (item.quantity / card.quantity) * 100 : 0;
      return { ...item, compositionPct: pct };
    });
  }, [card.rawMaterials, card.quantity]);

  // Base price per unit from master
  const basePricePerUnit = Number(currentMetal?.prices?.[0]?.pricePerUnit ?? 0);
  
  // Calculate Standard cost (multiplier and extra price applied)
  const gradeMultiplier = Number(currentGrade?.multiplier ?? 1);
  const extraPrice = Number(currentGrade?.extraPrice ?? 0);
  const standardUnitPrice = basePricePerUnit * gradeMultiplier + extraPrice;
  const standardTotalCost = card.quantity * standardUnitPrice;

  // Calculate Raw Materials cost
  const rawMaterialsTotalCost = mappedRawMaterials.reduce((total, item) => {
    const raw = rawMaterialsList.find((rm) => rm.id === item.rawMaterialId);
    const rawPrice = Number(raw?.prices?.[0]?.pricePerUnit ?? 0);
    return total + (item.quantity * rawPrice);
  }, 0);

  const rawMaterialsTotalQty = mappedRawMaterials.reduce((total, item) => total + item.quantity, 0);

  // Check if we should override using raw materials
  const usesRawMaterials = mappedRawMaterials.length > 0;
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

  // Reactively scales all nested raw materials weights based on their composition percentages
  const handleQuantityChange = (quantity: number) => {
    const nextQty = Math.max(0, quantity);
    
    const scaledRawMaterials = card.rawMaterials.map((item) => {
      const pct = item.compositionPct !== undefined ? item.compositionPct : (card.quantity > 0 ? (item.quantity / card.quantity) * 100 : 0);
      const computedQty = (pct / 100) * nextQty;
      return { 
        ...item, 
        quantity: computedQty, 
        compositionPct: pct 
      };
    });

    onUpdate({
      ...card,
      quantity: nextQty,
      rawMaterials: scaledRawMaterials
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

  // Options map for design system Select controls
  const metalOptions = useMemo(() => {
    return metalsList.map((m) => ({ value: m.id, label: m.name }));
  }, [metalsList]);

  const gradeOptions = useMemo(() => {
    return availableGrades.map((g) => ({ value: g.id, label: g.name }));
  }, [availableGrades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative text-left"
    >
      <Card className="overflow-hidden border-[#d6dfeb] bg-white shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md relative">
        {/* Decorative JSW blue accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-[#0057b8] opacity-80" />

        <CardContent className="p-5 pt-6 flex flex-col gap-4">
          {/* Header Action controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf5ff] text-xs font-bold text-[#0057b8]">
                {index + 1}
              </span>
              <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                {currentMetal?.name || "Select Metal"} Calc Card
              </h3>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-500 p-0"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Core Controls Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Metal Selection */}
            <Select
              label="Metal / Alloy"
              value={card.metalId}
              options={metalOptions}
              onChange={(e) => handleMetalChange(e.target.value)}
            />

            {/* Grade Selection */}
            <Select
              label="Grade"
              value={card.gradeId}
              options={gradeOptions}
              onChange={(e) => handleGradeChange(e.target.value)}
            />

            {/* Card Quantity Weight */}
            <Input
              label="Quantity (kg)"
              type="number"
              value={card.quantity === 0 ? "" : card.quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              placeholder="0.00"
              rightIcon={<span className="text-[10px] font-bold text-slate-400">kg</span>}
            />

            {/* Locked Calculated unit price */}
            <div className="flex flex-col gap-1 w-full text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#56657a] flex items-center justify-between">
                <span>Price / kg</span>
                <Badge variant="success" icon={<Lock className="h-2.5 w-2.5" />} className="px-1.5 py-0 rounded text-[8px]">
                  master
                </Badge>
              </label>
              <div className="flex h-9.5 w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-bold text-[#10233d]">
                <span>{inr(computedUnitPrice)}</span>
                {usesRawMaterials && (
                  <Badge variant="info" className="px-1 py-0 rounded text-[8px]">Alloyed</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Visual compositions legend if raw materials are configured */}
          {usesRawMaterials && (
            <div className="rounded-xl border border-dashed border-blue-200 bg-slate-50/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-600">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  <span>Alloy Composition Ratio</span>
                </div>
                <div className="text-slate-400 font-bold text-[10px]">
                  Ingredient Weight: <strong className="text-[#0057b8]">{rawMaterialsTotalQty.toLocaleString()} kg</strong>
                </div>
              </div>
              
              {/* Composition segment bar */}
              <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                {mappedRawMaterials.map((item, idx) => {
                  const raw = rawMaterialsList.find((r) => r.id === item.rawMaterialId);
                  const pct = rawMaterialsTotalQty > 0 ? (item.quantity / rawMaterialsTotalQty) * 100 : 0;
                  const bgColors = ["bg-[#0057b8]", "bg-[#0b63c8]", "bg-[#8b5cf6]", "bg-[#14b8a6]", "bg-[#f2994a]"];
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

              {/* Legends labels */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {mappedRawMaterials.map((item, idx) => {
                  const raw = rawMaterialsList.find((r) => r.id === item.rawMaterialId);
                  const pct = rawMaterialsTotalQty > 0 ? (item.quantity / rawMaterialsTotalQty) * 100 : 0;
                  const dotColors = ["bg-[#0057b8]", "bg-[#0b63c8]", "bg-[#8b5cf6]", "bg-[#14b8a6]", "bg-[#f2994a]"];
                  const dotColor = dotColors[idx % dotColors.length];
                  return (
                    <div key={item.id} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                      <span>{raw?.name}: {pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action trigger row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8.5 gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-[#56657a]"
              onClick={toggleExpand}
              leftIcon={card.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            >
              <span>{card.isExpanded ? "Collapse Recipe" : `Expand Raw Materials (${card.rawMaterials.length})`}</span>
            </Button>

            <div className="flex items-center gap-3">
              {usesRawMaterials && (
                <div className="text-right hidden sm:block">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Calculated Cost
                  </span>
                  <strong className="text-sm font-black text-[#0057b8]">
                    {inr(computedTotalCost)}
                  </strong>
                </div>
              )}

              <Button
                size="sm"
                className="h-8.5 font-bold shadow-xs"
                onClick={onAddToSummary}
                rightIcon={<TrendingUp className="h-3.5 w-3.5" />}
              >
                Add to Summary
              </Button>
            </div>
          </div>

          {/* Expandable composition detail list */}
          <AnimatePresence initial={false}>
            {card.isExpanded && (
              <motion.div
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { height: "auto", opacity: 1, marginTop: 12 },
                  collapsed: { height: 0, opacity: 0, marginTop: 0 },
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-slate-400" /> Alloy Composition Table
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold hidden md:block">
                      Nested ingredients belong to this alloy card run only.
                    </p>
                  </div>

                  <RawMaterialTable
                    rawMaterials={card.rawMaterials}
                    rawMaterialsList={rawMaterialsList}
                    cardQuantity={card.quantity}
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
