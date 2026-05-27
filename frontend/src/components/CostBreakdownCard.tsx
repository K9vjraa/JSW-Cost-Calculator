import { CheckCircle2, Info, Receipt, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/utils";

interface CostBreakdownCardProps {
  totalQuantity: number;
  subtotal: number;
  grandTotal: number;
  status?: string;
  batchId?: string;
}

export function CostBreakdownCard({
  totalQuantity,
  subtotal,
  grandTotal,
  status = "DRAFT",
  batchId = "SIMULATION",
}: CostBreakdownCardProps) {
  return (
    <Card className="border-slate-200 bg-white overflow-hidden shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3.5 px-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Cost Engine Report Breakdown
          </CardTitle>
        </div>
        <Badge className={`font-bold text-[9px] uppercase px-2 py-0.5 rounded ${
          status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
        }`}>
          {status} ({batchId})
        </Badge>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-[#fafcff] p-4 text-xs">
            <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
              Batch Quantity
            </span>
            <strong className="text-xl font-black text-slate-800">
              {totalQuantity.toLocaleString()} <span className="text-sm font-medium text-slate-500">kg</span>
            </strong>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#fafcff] p-4 text-xs">
            <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
              Material Subtotal
            </span>
            <strong className="text-xl font-black text-slate-800">
              {inr(subtotal)}
            </strong>
          </div>
        </div>

        {/* Large Summary Output */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Grand Final Cost
            </span>
            <strong className="block text-3xl font-black tracking-tight text-white">
              {inr(grandTotal)}
            </strong>
          </div>
          
          <div className="flex flex-col gap-1 text-[10px] font-bold text-indigo-200 uppercase tracking-wider bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>JSW Certified Pricing</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Master Lock Active</span>
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] text-slate-500 font-semibold leading-relaxed">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Disclaimer: This calculation uses JSW Steel's central price list masters, applying grade premium coefficients. Surcharges and logistics components are excluded. The generated cost sheet is draft-ready.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
