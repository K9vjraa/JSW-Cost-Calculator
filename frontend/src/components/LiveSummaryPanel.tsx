import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calculator, Info, Lock, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/utils";

export interface SummaryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  gradeMultiplier: number;
  extraPrice: number;
  baseCost: number;
}

interface LiveSummaryPanelProps {
  items: SummaryItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onClearAll: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
}

export function LiveSummaryPanel({
  items,
  onRemove,
  onUpdateQty,
  onClearAll,
  onSaveDraft,
  onComplete,
}: LiveSummaryPanelProps) {
  // Sum up base subtotal
  const subtotal = items.reduce((total, item) => total + item.baseCost, 0);
  
  const grandTotal = subtotal;

  const totalQty = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Card className="sticky top-6 border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col h-full max-h-[85vh]">
      {/* High-Contrast Header */}
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4.5 w-4.5 text-blue-400" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Live Cost Sheet
          </CardTitle>
        </div>
        
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md text-xs font-bold"
            onClick={onClearAll}
          >
            Clear Sheet
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin gap-4">
        {/* Selected Items List */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Selected Items ({items.length})
          </span>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl py-12 px-4 text-center">
              <Calculator className="h-9 w-9 text-slate-300 mb-3 animate-pulse" />
              <strong className="text-slate-700 text-xs font-bold block mb-1">
                Workspace Empty
              </strong>
              <p className="text-[11px] text-slate-400 font-semibold max-w-[200px]">
                Add alloy cards from left workspace panel to run live pricing simulation.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence initial={false}>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border border-slate-150 rounded-xl bg-slate-50 hover:bg-white transition-colors duration-200 shadow-sm relative group"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-xs text-slate-800">
                        {idx + 1}. {item.name}
                      </span>
                      <button
                        className="text-slate-400 hover:text-red-500 rounded p-0.5"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Adjustable Grid */}
                    <div className="grid grid-cols-3 gap-2 items-center text-[10px]">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-0.5">Quantity</span>
                        <Input
                          type="number"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => onUpdateQty(item.id, Math.max(0, Number(e.target.value)))}
                          className="h-7 text-xs font-bold py-0.5 px-1.5 w-20 rounded-md bg-white border border-slate-200"
                        />
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-slate-400 font-bold uppercase mb-1">Price/kg</span>
                        <strong className="text-slate-700 block mt-0.5">{inr(item.unitPrice)}</strong>
                      </div>

                      <div className="text-right">
                        <span className="block text-slate-400 font-bold uppercase mb-1">Item Cost</span>
                        <strong className="text-blue-600 font-extrabold block mt-0.5">{inr(item.baseCost)}</strong>
                      </div>
                    </div>

                    {/* Badge details */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Locked Master Prices</span>
                      <span>Mult: {item.gradeMultiplier}x</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Dynamic Billing Calculations & Totals Panel */}
        <div className="space-y-4 pt-4 border-t border-slate-150">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 font-semibold">
              <span>Material Subtotal ({totalQty.toLocaleString()} kg)</span>
              <span className="font-bold text-slate-800">{inr(subtotal)}</span>
            </div>
          </div>

          {/* LARGE BOLD TOTAL BOX */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 p-4 text-white shadow-inner flex flex-col gap-1.5 relative overflow-hidden">
            {/* Decentered glow styling */}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 pointer-events-none" />

            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-blue-200">
              <span>Grand Estimated Cost</span>
              <Badge className="bg-blue-600/30 text-blue-200 border-none font-bold text-[9px] flex items-center gap-0.5 rounded px-1.5 py-0.5">
                <Lock className="h-2.5 w-2.5" /> master locked
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black tracking-tight flex items-center">
                {inr(grandTotal)}
              </strong>
            </div>

            <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-indigo-200 border-t border-indigo-800 pt-1.5">
              <Info className="h-3 w-3" />
              <span>JSW Certified Calculation Cost run</span>
            </div>
          </div>

          {/* Master Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
              onClick={onSaveDraft}
              disabled={items.length === 0}
            >
              Save Draft
            </Button>
            <Button
              className="h-10 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 text-xs flex items-center justify-center gap-1 shadow-md"
              onClick={onComplete}
              disabled={items.length === 0}
            >
              <span>Submit Calc</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
