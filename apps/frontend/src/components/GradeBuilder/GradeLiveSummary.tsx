import { useMemo } from "react";
import { Card, CardContent, inr, Badge } from "@jsw-mcms/ui";
import { CheckCircle2, AlertCircle, Calendar, Info } from "lucide-react";
import { useGradeBuilderStore } from "../../store/gradeBuilderStore";
import { useGrades } from "../../services/gradeMasterApi";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { Button } from "../ui/button";

export function GradeLiveSummary() {
  const { materials, targetQuantity, selectedGradeId } = useGradeBuilderStore();
  const { data: gradesList = [] } = useGrades();
  
  const activeGrade = selectedGradeId && selectedGradeId !== 'new' ? gradesList.find((g: any) => g.id === selectedGradeId) : null;
  const isNewGrade = selectedGradeId === 'new';

  const totalPct = useMemo(() => materials.reduce((sum, item) => sum + (Number(item.compositionPercent) || 0), 0), [materials]);
  
  const mappedMaterials = useMemo(() => materials.map(m => {
    const computedQty = (Number(m.compositionPercent) / 100) * targetQuantity;
    return { ...m, computedQty, cost: computedQty * m.rate };
  }), [materials, targetQuantity]);

  const totalCost = useMemo(() => mappedMaterials.reduce((sum, m) => sum + m.cost, 0), [mappedMaterials]);
  const costPerKg = targetQuantity > 0 ? totalCost / targetQuantity : 0;
  
  const isCompositionValid = Math.abs(totalPct - 100) < 0.01;
  const materialCount = materials.length;
  const totalWeight = targetQuantity;
  const allPriced = materials.every(m => m.rate > 0);
  const hasMaterials = materials.length > 0;
  const isReadyToSave = isCompositionValid && hasMaterials && allPriced;

  const statusLabel = isNewGrade ? 'DRAFT' : activeGrade?.status || 'DRAFT';
  const lastSaved = activeGrade?.updatedAt 
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(activeGrade.updatedAt)) 
    : 'Unsaved';
    
  return (
    <Card className="border-border bg-white shadow-sm rounded-md flex flex-col min-w-0 h-full overflow-y-auto scrollbar-thin">
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Unified Intelligent Summary Panel */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-bold text-slate-805 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1.5">
            Intelligent Summary
          </h3>
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-sm divide-y divide-slate-100">
            <div className="flex justify-between items-center px-3 py-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Cost</span>
               <span className="text-xs font-black text-primary font-mono" title={inr(totalCost)}>{inr(totalCost)}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Cost / KG</span>
               <span className="text-xs font-black text-emerald-600 font-mono" title={inr(costPerKg)}>{inr(costPerKg)}</span>
            </div>
          </div>
          
          <Accordion type="multiple" className="flex flex-col gap-2 mt-2">
             <AccordionItem value="validation" className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 transition-colors text-[10px] uppercase font-bold text-slate-600 data-[state=open]:border-b border-slate-200">
                  Validation
                </AccordionTrigger>
                <AccordionContent className="p-2 border-none bg-slate-50/50">
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 p-2 rounded-sm border text-[10px] font-bold uppercase ${isCompositionValid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {isCompositionValid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                      100% Composition
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded-sm border text-[10px] font-bold uppercase ${allPriced && hasMaterials ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (!allPriced ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200')}`}>
                      {allPriced && hasMaterials ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : (!allPriced ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> : <Info className="h-3.5 w-3.5 text-slate-400" />)}
                      All Materials Priced
                    </div>
                  </div>
                </AccordionContent>
             </AccordionItem>

             <AccordionItem value="properties" className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 transition-colors text-[10px] uppercase font-bold text-slate-600 data-[state=open]:border-b border-slate-200">
                  Properties
                </AccordionTrigger>
                <AccordionContent className="p-0 border-none">
                  <div className="divide-y divide-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Material Count</span>
                       <span className="text-[10px] font-bold text-slate-700 font-mono">{materialCount}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Weight (KG)</span>
                       <span className="text-[10px] font-bold text-slate-700 font-mono">{totalWeight}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Composition %</span>
                       <span className={`text-[10px] font-bold font-mono ${isCompositionValid ? 'text-emerald-600' : 'text-rose-600'}`}>{totalPct.toFixed(2)}%</span>
                    </div>
                  </div>
                </AccordionContent>
             </AccordionItem>

             <AccordionItem value="metadata" className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 transition-colors text-[10px] uppercase font-bold text-slate-600 data-[state=open]:border-b border-slate-200">
                  Metadata
                </AccordionTrigger>
                <AccordionContent className="p-0 border-none">
                  <div className="divide-y divide-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Status</span>
                       <Badge variant="outline" className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${statusLabel === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : statusLabel === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-200 text-slate-700 border-slate-400'}`}>
                         {statusLabel}
                       </Badge>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Version</span>
                       <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-300 px-1.5 rounded-sm">
                         v{activeGrade?.version || 1}
                       </span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                       <span className="text-[10px] font-bold text-slate-500">Last Saved</span>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                         <Calendar className="h-3 w-3 text-slate-400" />
                         <span className="truncate max-w-[90px]" title={lastSaved}>{lastSaved}</span>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
             </AccordionItem>

             <AccordionItem value="comparison" className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 transition-colors text-[10px] uppercase font-bold text-slate-600 data-[state=open]:border-b border-slate-200">
                  Comparison Insights
                </AccordionTrigger>
                <AccordionContent className="p-3 border-none bg-slate-50/50">
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">Variance Analysis</p>
                    <p className="font-medium text-slate-500 leading-relaxed text-[10px]">Run a full comparison to analyze cost variance against historical averages.</p>
                    <Button variant="ghost" className="px-0 text-[#1A365D] h-auto text-[10px] font-bold mt-2 hover:bg-transparent underline-offset-2 hover:underline">
                      View full comparison →
                    </Button>
                  </div>
                </AccordionContent>
             </AccordionItem>
          </Accordion>
          
        </div>
      </CardContent>
    </Card>
  );
}
