import { Plus, Trash2, Lock, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button, Input, Badge, inr } from "@jsw-mcms/ui";
import type { RawMaterial } from "@/types";

export interface RawMaterialItem {
  id: string;
  rawMaterialId: string;
  quantity: number;
  compositionPct?: number; // Optional metallurgical percentage
}

interface RawMaterialTableProps {
  rawMaterials: RawMaterialItem[];
  rawMaterialsList: RawMaterial[];
  cardQuantity: number;
  onUpdate: (materials: RawMaterialItem[]) => void;
}

export function RawMaterialTable({
  rawMaterials,
  rawMaterialsList,
  cardQuantity,
  onUpdate,
}: RawMaterialTableProps) {
  
  // Dynamic step adding a new ingredient row
  const addRow = () => {
    const defaultRaw = rawMaterialsList[0];
    if (!defaultRaw) return;
    
    const newRow: RawMaterialItem = {
      id: crypto.randomUUID(),
      rawMaterialId: defaultRaw.id,
      quantity: cardQuantity > 0 ? cardQuantity * 0.1 : 10,
      compositionPct: 10
    };
    onUpdate([...rawMaterials, newRow]);
  };

  // Dynamically computes the composition percentage for any item
  const getItemPct = (item: RawMaterialItem) => {
    if (item.compositionPct !== undefined) return item.compositionPct;
    if (cardQuantity > 0) return (item.quantity / cardQuantity) * 100;
    return 0;
  };

  // Handles updating the percentage and recalculating the quantity
  const handlePctChange = (id: string, pctVal: number) => {
    const safePct = Math.max(0, Math.min(100, pctVal));
    const calculatedQty = cardQuantity > 0 ? (safePct / 100) * cardQuantity : 0;
    
    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return { 
          ...row, 
          compositionPct: safePct, 
          quantity: calculatedQty 
        };
      }
      return row;
    });
    onUpdate(updated);
  };

  // Handles updating the select option dropdown
  const handleMaterialChange = (id: string, rawMaterialId: string) => {
    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return { ...row, rawMaterialId };
      }
      return row;
    });
    onUpdate(updated);
  };

  const removeRow = (id: string) => {
    onUpdate(rawMaterials.filter((row) => row.id !== id));
  };

  // Calculate sum totals
  const totalPct = rawMaterials.reduce((sum, item) => sum + getItemPct(item), 0);
  const totalQuantity = rawMaterials.reduce((sum, item) => sum + (cardQuantity > 0 ? (getItemPct(item) / 100) * cardQuantity : item.quantity), 0);
  
  const totalCost = rawMaterials.reduce((sum, item) => {
    const currentMaterial = rawMaterialsList.find((r) => r.id === item.rawMaterialId) || rawMaterialsList[0];
    const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);
    const qty = cardQuantity > 0 ? (getItemPct(item) / 100) * cardQuantity : item.quantity;
    return sum + (qty * pricePerKg);
  }, 0);

  // Check balanced state (within 0.1% tolerance to account for floating points)
  const isRecipeBalanced = Math.abs(totalPct - 100) < 0.1;

  return (
    <div className="rounded-xl border border-[#d6dfeb] bg-[#fafcff] overflow-hidden text-left shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-[#d6dfeb]">
              <th className="h-9 px-4 text-left font-bold text-[#56657a] uppercase tracking-wider text-[10px]">
                Raw Material Ingredient
              </th>
              <th className="h-9 px-4 text-right font-bold text-[#56657a] uppercase tracking-wider text-[10px] w-28">
                Composition %
              </th>
              <th className="h-9 px-4 text-right font-bold text-[#56657a] uppercase tracking-wider text-[10px] w-32">
                Auto Qty (kg)
              </th>
              <th className="h-9 px-4 text-right font-bold text-[#56657a] uppercase tracking-wider text-[10px] w-32">
                Locked Price
              </th>
              <th className="h-9 px-4 text-right font-bold text-[#56657a] uppercase tracking-wider text-[10px] w-32">
                Material Cost
              </th>
              <th className="h-9 w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rawMaterials.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-20 text-center text-[#56657a] font-semibold">
                  No raw materials configured. Click "Add Ingredient" below to build custom alloy recipe.
                </td>
              </tr>
            ) : (
              rawMaterials.map((row) => {
                const currentMaterial = rawMaterialsList.find((r) => r.id === row.rawMaterialId) || rawMaterialsList[0];
                const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);
                
                const pct = getItemPct(row);
                const qty = cardQuantity > 0 ? (pct / 100) * cardQuantity : row.quantity;
                const cost = qty * pricePerKg;

                return (
                  <tr key={row.id} className="border-b border-[#d6dfeb]/50 hover:bg-slate-50/50 transition-colors">
                    {/* Material Selector */}
                    <td className="py-2 px-4">
                      <select
                        className="h-8 w-full rounded-lg border border-[#d6dfeb] bg-white px-2 text-xs font-bold text-[#10233d] transition-colors focus:border-[#0057b8] focus:outline-none cursor-pointer"
                        value={row.rawMaterialId}
                        onChange={(e) => handleMaterialChange(row.id, e.target.value)}
                      >
                        {rawMaterialsList.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} ({rm.code})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Editable Composition Percentage */}
                    <td className="py-2 px-4">
                      <div className="relative flex items-center justify-end">
                        <Input
                          type="number"
                          step="any"
                          className="h-8 text-right text-xs font-extrabold pr-6 w-20 rounded-lg border-[#d6dfeb]"
                          value={pct === 0 ? "" : Number(pct.toFixed(2))}
                          onChange={(e) => handlePctChange(row.id, Number(e.target.value))}
                          placeholder="0.0"
                        />
                        <span className="absolute right-2 text-[10px] font-bold text-[#56657a]">
                          %
                        </span>
                      </div>
                    </td>

                    {/* Calculated Auto Weight Quantity */}
                    <td className="py-2 px-4 text-right">
                      <div className="h-8 flex items-center justify-end font-bold text-slate-700 pr-1">
                        <span>{qty.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-400 font-semibold ml-1">kg</span>
                      </div>
                    </td>

                    {/* Locked Price Master */}
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-[#56657a]">
                        <span>{inr(pricePerKg)} / kg</span>
                        <Lock className="h-3 w-3 text-slate-400" />
                      </div>
                    </td>

                    {/* Calculated ingredient cost */}
                    <td className="py-2 px-4 text-right font-black text-slate-800">
                      {inr(cost)}
                    </td>

                    {/* Remove Action */}
                    <td className="py-2 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 rounded-md text-[#56657a] hover:bg-slate-100 hover:text-red-500 p-0"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer Actions & Dynamic Balance Badges */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#d6dfeb] bg-slate-50/50 p-3.5 gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg border-dashed border-[#d6dfeb] text-xs font-bold text-[#56657a] hover:bg-white hover:text-[#0057b8]"
          onClick={addRow}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Add Ingredient
        </Button>

        {rawMaterials.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Dynamic Stepper Balance Capsule */}
            <Badge 
              variant={isRecipeBalanced ? "success" : "warning"}
              icon={isRecipeBalanced ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />}
            >
              {isRecipeBalanced 
                ? "✓ Recipe Balanced (100%)" 
                : `⚠ Recipe Unbalanced (${Number(totalPct.toFixed(1))}% / 100%)`}
            </Badge>

            <div className="text-right text-xs font-bold text-[#10233d]">
              Alloy Cost subtotal: <span className="text-[#0057b8] font-black">{inr(totalCost)}</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mt-0.5">
                Total Weight: {totalQuantity.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
