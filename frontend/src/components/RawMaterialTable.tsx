import { Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr } from "@/utils";
import type { RawMaterial } from "@/types";
import type { RawMaterialItem } from "./AlloyInputCard";

interface RawMaterialTableProps {
  rawMaterials: RawMaterialItem[];
  rawMaterialsList: RawMaterial[];
  onUpdate: (materials: RawMaterialItem[]) => void;
}

export function RawMaterialTable({
  rawMaterials,
  rawMaterialsList,
  onUpdate,
}: RawMaterialTableProps) {
  const addRow = () => {
    const defaultRaw = rawMaterialsList[0];
    if (!defaultRaw) return;
    
    const newRow: RawMaterialItem = {
      id: crypto.randomUUID(),
      rawMaterialId: defaultRaw.id,
      quantity: 10,
    };
    onUpdate([...rawMaterials, newRow]);
  };

  const handleRowChange = (id: string, updates: Partial<RawMaterialItem>) => {
    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return { ...row, ...updates };
      }
      return row;
    });
    onUpdate(updated);
  };

  const removeRow = (id: string) => {
    onUpdate(rawMaterials.filter((row) => row.id !== id));
  };

  return (
    <div className="rounded-xl border border-slate-150 bg-[#fafcff] overflow-hidden">
      <Table className="w-full text-xs">
        <TableHeader className="bg-slate-100/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="h-9 font-bold text-slate-600">Raw Material Ingredient</TableHead>
            <TableHead className="h-9 text-right font-bold text-slate-600 w-24">Qty (kg)</TableHead>
            <TableHead className="h-9 text-right font-bold text-slate-600 w-32">Locked Price</TableHead>
            <TableHead className="h-9 text-right font-bold text-slate-600 w-32">Material Cost</TableHead>
            <TableHead className="h-9 w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawMaterials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-20 text-center text-slate-400 font-medium">
                No raw materials configured. Click "Add Ingredient" below to build custom alloy recipe.
              </TableCell>
            </TableRow>
          ) : (
            rawMaterials.map((row) => {
              const currentMaterial = rawMaterialsList.find((r) => r.id === row.rawMaterialId) || rawMaterialsList[0];
              const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);
              const cost = row.quantity * pricePerKg;

              return (
                <TableRow key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="py-2">
                    <select
                      className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition-colors focus:border-blue-400 focus:outline-none"
                      value={row.rawMaterialId}
                      onChange={(e) => handleRowChange(row.id, { rawMaterialId: e.target.value })}
                    >
                      {rawMaterialsList.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name} ({rm.code})
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      className="h-8 text-right text-xs font-bold w-full rounded-lg"
                      value={row.quantity === 0 ? "" : row.quantity}
                      onChange={(e) => handleRowChange(row.id, { quantity: Math.max(0, Number(e.target.value)) })}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1 font-semibold text-slate-500">
                      <span>{inr(pricePerKg)} / kg</span>
                      <Lock className="h-3 w-3 text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-right font-bold text-slate-800">
                    {inr(cost)}
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-md text-slate-400 hover:bg-slate-100 hover:text-red-500 p-0"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      
      {/* Table Footer Action */}
      <div className="flex items-center justify-between border-t border-slate-150 bg-slate-50/50 p-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-300"
          onClick={addRow}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Ingredient</span>
        </Button>

        {rawMaterials.length > 0 && (
          <div className="text-right text-xs font-bold text-slate-700 pr-2">
            Alloy Subtotal: <span className="text-blue-600 font-extrabold">{inr(rawMaterials.reduce((t, r) => t + (r.quantity * Number(rawMaterialsList.find((rm) => rm.id === r.rawMaterialId)?.prices?.[0]?.pricePerUnit ?? 0)), 0))}</span>
          </div>
        )}
      </div>
    </div>
  );
}
