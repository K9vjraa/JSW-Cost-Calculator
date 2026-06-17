import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calculator, Info, Lock, Receipt, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, inr } from "@jsw-mcms/ui";

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
    <Card className="border-border bg-white overflow-hidden flex flex-col h-full max-h-full rounded-md shadow-none">
      {/* High-Contrast Header */}
      <CardHeader className="border-b border-border bg-slate-50 text-slate-800 py-3 px-4 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Receipt className="h-4.5 w-4.5 text-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Live Cost Sheet
          </CardTitle>
        </div>
        
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[#56657a] hover:text-red-500 hover:bg-slate-100 rounded-sm text-xs font-bold"
            onClick={onClearAll}
          >
            Clear Sheet
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden gap-3">
        {/* Selected Items List */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 shrink-0">
            Selected Items ({items.length})
          </span>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-sm py-6 px-4 text-center">
              <Calculator className="h-7 w-7 text-slate-300 mb-2 animate-pulse" />
              <strong className="text-slate-700 text-xs font-bold block mb-1">
                No Materials Added
              </strong>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] leading-normal">
                Select a metal card and click "Add To Industrial Summary" to start live cost simulation.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin pb-2">
              <AnimatePresence initial={false}>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border border-border rounded-sm bg-[#f9f9ff] hover:bg-white transition-colors duration-200 relative group"
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
                          className="h-7 text-xs font-bold py-0.5 px-1.5 w-20 rounded-sm bg-white border border-border font-geist"
                        />
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-slate-400 font-bold uppercase mb-1">Price/kg</span>
                        <strong className="text-slate-700 block mt-0.5 font-geist">{inr(item.unitPrice)}</strong>
                      </div>

                      <div className="text-right">
                        <span className="block text-slate-400 font-bold uppercase mb-1">Item Cost</span>
                        <strong className="text-blue-600 font-extrabold block mt-0.5 font-geist">{inr(item.baseCost)}</strong>
                      </div>
                    </div>

                    {/* Badge details */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Locked Master Prices</span>
                      <span className="font-geist">Mult: {item.gradeMultiplier}x</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Dynamic Billing Calculations & Totals Panel */}
        <div className="space-y-3 pt-3 border-t border-slate-150 shrink-0 bg-white z-10 sticky bottom-0">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 font-semibold mb-1">
              <span>Material Subtotal (<span className="font-geist">{totalQty.toLocaleString()}</span> kg)</span>
              <span className="font-bold text-slate-800 font-geist">{inr(subtotal)}</span>
            </div>
          </div>

          {/* LARGE BOLD TOTAL BOX */}
          <div className="rounded-sm bg-jsw-corp p-3 text-white flex flex-col gap-1.5 relative overflow-hidden">
            {/* Decentered glow styling */}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 pointer-events-none" />

            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-blue-200">
              <span>Grand Estimated Cost</span>
              <Badge className="bg-blue-600/30 text-blue-200 border-none font-bold text-[9px] flex items-center gap-0.5 rounded-sm px-1.5 py-0.5">
                <Lock className="h-2.5 w-2.5" /> master locked
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <strong className="text-2xl font-black tracking-tight flex items-center font-geist">
                {inr(grandTotal)}
              </strong>
            </div>

            <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-indigo-200 border-t border-blue-900 pt-1.5">
              <Info className="h-3 w-3" />
              <span>JSW Certified Calculation Cost run</span>
            </div>
          </div>

          {/* Master Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              className="h-8 rounded-sm font-bold border-border text-slate-700 hover:bg-slate-50 text-xs"
              onClick={onSaveDraft}
              disabled={items.length === 0}
            >
              Save Draft
            </Button>
            <Button
              className="h-8 rounded-sm font-bold bg-blue-600 text-white hover:bg-blue-700 text-xs flex items-center justify-center gap-1 shadow-md border-none"
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
