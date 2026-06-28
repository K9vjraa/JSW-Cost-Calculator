import { useState, useMemo, useEffect } from "react";
import { Save, Download, Calculator, CheckCircle, AlertCircle, Activity, Database, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, Input, Button, inr } from "@jsw-mcms/ui";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useGrades, useGradeMaterials } from "../services/gradeMasterApi";
import { Pie } from "react-chartjs-2";
import { api } from "@/services/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GradeCompositionModuleProps {
  rawMaterialsList?: any[]; // Kept for interface compatibility but we will use real API now
}

export function GradeCompositionModule({ rawMaterialsList = [] }: GradeCompositionModuleProps) {
  const { addSummaryItem } = useWorkspaceStore();

  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();

  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  
  // Real dynamic composition state for the selected grade
  const { data: gradeMaterials = [], isLoading: isLoadingMaterials } = useGradeMaterials(selectedGradeId);

  const [targetQuantity, setTargetQuantity] = useState<number>(1000);

  // Group grades for sidebar
  const groupedGrades = useMemo(() => {
    return grades.reduce((acc: any, grade: any) => {
      const type = grade.process_type || "Other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(grade);
      return acc;
    }, {} as Record<string, any[]>);
  }, [grades]);

  const activeGrade = grades.find((g: any) => g.id === selectedGradeId);

  // Local state for edits if user wants to tweak the imported composition
  // To keep it simple, we initialize local state when `gradeMaterials` changes
  const [localMaterials, setLocalMaterials] = useState<any[]>([]);
  
  // Sync local edits when fetched data changes
  useEffect(() => {
    if (gradeMaterials) {
      setLocalMaterials(gradeMaterials.map((m: any) => ({
        ...m,
        id: m.id || crypto.randomUUID()
      })));
    }
  }, [gradeMaterials]);

  // Live calculations
  const totalPct = useMemo(() => {
    return localMaterials.reduce((sum: number, item: any) => sum + Number(item.composition_percent), 0);
  }, [localMaterials]);

  const mappedMaterials = useMemo(() => {
    return localMaterials.map((item: any) => {
      const mat = rawMaterialsList.find((m: any) => 
        m.materialName.toLowerCase() === item.material?.material_name?.toLowerCase() || 
        m.rawMatId === item.material?.material_code
      );
      const fallbackMat = item.material;
      
      const rawPrice = Number(mat?.currentRate || fallbackMat?.current_rate || item.rate || 0);
      const computedQty = (Number(item.composition_percent) / 100) * targetQuantity;
      return {
        ...item,
        computedQty,
        rawPrice,
        cost: computedQty * rawPrice,
        materialName: mat?.alloyName || fallbackMat?.material_name || "Unknown Material"
      };
    });
  }, [localMaterials, targetQuantity, rawMaterialsList]);

  const totalCost = useMemo(() => {
    return mappedMaterials.reduce((sum: number, item: any) => sum + item.cost, 0);
  }, [mappedMaterials]);

  const costPerKg = targetQuantity > 0 ? totalCost / targetQuantity : 0;
  const isCompositionValid = Math.abs(totalPct - 100) < 0.01;

  // Analysis Stats
  const materialCount = mappedMaterials.length;
  const sortedByCost = [...mappedMaterials].sort((a, b) => b.cost - a.cost);
  const highestCostMaterial = sortedByCost[0];

  // Chart Data
  const compositionChartData = {
    labels: mappedMaterials.map((m: any) => m.materialName),
    datasets: [{
      data: mappedMaterials.map((m: any) => Number(m.composition_percent)),
      backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#1d4ed8', '#1e40af', '#1e3a8a'],
      borderWidth: 1,
    }]
  };

  const costChartData = {
    labels: mappedMaterials.map((m: any) => m.materialName),
    datasets: [{
      data: mappedMaterials.map((m: any) => m.cost),
      backgroundColor: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#047857', '#065f46', '#064e3b'],
      borderWidth: 1,
    }]
  };

  const handleUpdateMaterial = (id: string, field: string, value: any) => {
    setLocalMaterials(localMaterials.map((m: any) => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveGrade = () => {
    if (!activeGrade) {
      toast.error("Please select a grade first.");
      return;
    }
    if (!isCompositionValid) {
      toast.error("Total composition must be exactly 100%.");
      return;
    }
    
    const summaryItemId = `grade-builder-${activeGrade.grade_code}`;
    
    addSummaryItem({
      id: summaryItemId,
      name: activeGrade.grade_name || activeGrade.name,
      quantity: targetQuantity,
      unitPrice: costPerKg,
      gradeMultiplier: activeGrade.multiplier || 1.0,
      extraPrice: activeGrade.extraPrice || 0,
      baseCost: totalCost,
      metalId: activeGrade.metalId || "custom",
      gradeId: activeGrade.id,
      categoryName: activeGrade.process_type || "MS Hot Rolled",
      steelTypeName: "Custom Grade",
      gradeName: activeGrade.grade_name || activeGrade.name,
      subGradeName: activeGrade.subGrade || "Standard",
      rawMaterials: mappedMaterials.map((m: any) => ({
        id: m.id,
        rawMaterialId: m.material_id,
        quantity: m.computedQty,
        compositionPct: m.composition_percent
      })),
      isAlloyed: true
    });

    toast.success(`Grade ${activeGrade.grade_name || activeGrade.name} added to workspace summary!`);
  };

  const [selectedNewMaterial, setSelectedNewMaterial] = useState<string>("");

  const handleAddMaterial = () => {
    if (!selectedNewMaterial) return;
    const exists = localMaterials.find((m: any) => m.material_id === selectedNewMaterial);
    if (exists) {
      toast.error("Material already exists in composition");
      return;
    }
    const mat = rawMaterialsList.find((m: any) => m.id === selectedNewMaterial);
    if (!mat) return;

    setLocalMaterials([...localMaterials, {
      id: crypto.randomUUID(),
      material_id: mat.id,
      composition_percent: 0,
      material: {
        material_code: mat.code || mat.rawMatId,
        material_name: mat.materialName || mat.name,
        current_rate: mat.currentRate || mat.currentPrice
      }
    }]);
    setSelectedNewMaterial("");
  };

  const handleRemoveMaterial = (id: string) => {
    setLocalMaterials(localMaterials.filter((m: any) => m.id !== id));
  };

  const handleSaveGradeTemplate = async () => {
    if (!activeGrade) {
      toast.error("Please select a grade first.");
      return;
    }
    if (!isCompositionValid) {
      toast.error("Total composition must be exactly 100%.");
      return;
    }
    
    try {
      const chem = { ...activeGrade.chemicalComposition };
      chem.materials = localMaterials.map((m: any) => ({
        id: m.id,
        material_id: m.material_id,
        composition_percent: m.composition_percent,
        material: m.material
      }));
      
      await api.put(`/grades/${activeGrade.id}`, {
        chemicalComposition: chem
      });
      
      toast.success("Grade template saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save grade template.");
    }
  };

  const exportCSV = () => {
    const headers = ["Material", "Composition (%)", "Quantity (kg)", "Rate/kg (INR)", "Total Cost (INR)"];
    const rows = mappedMaterials.map((m: any) => {
      return [
        m.materialName,
        Number(m.composition_percent ?? 0).toFixed(2),
        Number(m.computedQty ?? 0).toFixed(2),
        Number(m.rawPrice ?? 0).toFixed(2),
        Number(m.cost ?? 0).toFixed(2)
      ].join(",");
    });
    
    rows.push(["TOTAL", Number(totalPct ?? 0).toFixed(2), Number(targetQuantity ?? 0).toFixed(2), Number(costPerKg ?? 0).toFixed(2), Number(totalCost ?? 0).toFixed(2)].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Grade_Composition_${activeGrade?.grade_code || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex h-full gap-4 animate-fade-in overflow-hidden">
      
      {/* LEFT PANEL: GRADE LIBRARY */}
      <Card className="w-64 border-border bg-white shadow-none rounded-sm overflow-hidden flex flex-col shrink-0">
        <div className="bg-slate-50 border-b border-slate-100 p-4">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Grade Library
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {isLoadingGrades ? (
            <div className="p-4 text-center text-slate-400 text-sm">Loading grades...</div>
          ) : (
            (Object.entries(groupedGrades) as [string, any[]][]).map(([processType, processGrades]) => (
              <div key={processType} className="mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 mt-2">
                  {processType}
                </h4>
                <div className="flex flex-col gap-1">
                  {processGrades.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGradeId(g.id);
                        setTargetQuantity(g.target_quantity || 1000);
                      }}
                      className={`text-left px-3 py-2 rounded-sm text-xs font-bold transition-all ${
                        selectedGradeId === g.id 
                          ? 'bg-blue-50 text-primary border border-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {g.grade_code}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* CENTER & RIGHT PANELS */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        
        {/* TOP PROPERTIES */}
        <Card className="border-border bg-white shadow-none rounded-sm overflow-hidden relative shrink-0">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  {activeGrade ? activeGrade.grade_name : 'Select a Grade'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {activeGrade ? `Process: ${activeGrade.process_type} | Code: ${activeGrade.grade_code}` : 'Choose a grade from the library to view composition.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportCSV} disabled={!activeGrade} variant="outline" className="h-9 font-bold text-xs cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={handleSaveGradeTemplate} 
                  variant="outline"
                  className="h-9 font-bold text-xs cursor-pointer border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  disabled={!isCompositionValid || !activeGrade}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Save Grade Template
                </Button>
                <Button 
                  onClick={handleSaveGrade} 
                  className="bg-jsw-blue hover:bg-primary text-white h-9 font-bold text-xs cursor-pointer"
                  disabled={!isCompositionValid || !activeGrade}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Summary
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Batch Quantity (kg)</label>
                  <Input
                    type="number"
                    value={targetQuantity}
                    onChange={e => setTargetQuantity(Number(e.target.value))}
                    min={0}
                    className="h-10"
                    disabled={!activeGrade}
                  />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM SECTION: TABLE & COST ANALYSIS */}
        {activeGrade ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4 min-h-0 overflow-hidden">
            
            {/* COMPOSITION TABLE */}
            <Card className="border-border bg-white shadow-none rounded-sm flex flex-col min-h-0">
              <CardContent className="p-0 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 shrink-0 gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Material Composition</h3>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-1 md:flex-none items-center gap-2">
                      <select 
                        className="h-9 text-xs border-slate-200 rounded-sm bg-white px-3 flex-1 min-w-[200px]"
                        value={selectedNewMaterial}
                        onChange={(e) => setSelectedNewMaterial(e.target.value)}
                        disabled={!activeGrade}
                      >
                        <option value="">Select Material to Add...</option>
                        {rawMaterialsList.filter((m: any) => m.isAvail !== false).map((m: any) => (
                          <option key={m.id} value={m.id}>{m.materialName || m.name} ({m.code || m.rawMatId})</option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleAddMaterial}
                        disabled={!selectedNewMaterial}
                        className="h-9"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-end whitespace-nowrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                      <div className={`flex items-center gap-1.5 font-black text-sm ${isCompositionValid ? 'text-green-600' : 'text-red-500'}`}>
                        {isCompositionValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {Number(totalPct ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto scrollbar-thin">
                  {isLoadingMaterials ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-bold">
                      Loading composition...
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] uppercase bg-slate-50 font-black tracking-wider text-slate-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3">Material</th>
                          <th className="px-4 py-3 w-32">Comp %</th>
                          <th className="px-4 py-3 text-right">Qty (kg)</th>
                          <th className="px-4 py-3 text-right">Rate/kg</th>
                          <th className="px-4 py-3 text-right">Cost</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mappedMaterials.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-bold text-slate-700">
                              {m.materialName}
                            </td>
                            <td className="px-4 py-2">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={m.composition_percent}
                                  onChange={e => handleUpdateMaterial(m.id, "composition_percent", parseFloat(e.target.value) || 0)}
                                  className={`h-8 pr-6 text-right font-mono font-bold ${!isCompositionValid && 'border-red-300'}`}
                                />
                                <span className="absolute right-2 top-1.5 text-slate-400 text-xs">%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-slate-700">
                              {Number(m.computedQty ?? 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-slate-700">
                              {inr(m.rawPrice)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">
                              {inr(m.cost)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveMaterial(m.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-black text-slate-800 sticky bottom-0 border-t border-slate-200">
                        <tr>
                          <td className="px-4 py-3 text-right uppercase text-xs">Total</td>
                          <td className="px-4 py-3">
                            <div className={`text-right ${isCompositionValid ? 'text-green-600' : 'text-red-500'}`}>
                              {Number(totalPct ?? 0).toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{Number(targetQuantity ?? 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">Avg: {inr(costPerKg)}</td>
                          <td className="px-4 py-3 text-right text-jsw-blue text-base">{inr(totalCost)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* COST ANALYSIS PANEL */}
            <Card className="border-border bg-white shadow-none rounded-sm flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
              <CardContent className="p-4 flex flex-col gap-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                  Cost Analysis
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-sm p-3 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Cost</span>
                    <strong className="text-lg text-primary font-black">{inr(totalCost)}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-sm p-3 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Cost Per KG</span>
                    <strong className="text-lg text-green-600 font-black">{inr(costPerKg)}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-sm p-3 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Materials</span>
                    <strong className="text-lg text-slate-700 font-black">{materialCount} Items</strong>
                  </div>
                  <div className={`rounded-sm p-3 border ${isCompositionValid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <span className="text-[10px] font-bold uppercase block mb-1 opacity-70">Total %</span>
                    <strong className="text-lg font-black">{Number(totalPct ?? 0).toFixed(2)}%</strong>
                  </div>
                </div>

                {highestCostMaterial && (
                  <div className="text-xs bg-red-50 text-red-900 p-3 rounded-sm border border-red-100 mt-2">
                    <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Highest Cost Contributor</span>
                    <div className="flex justify-between font-bold">
                      <span>{highestCostMaterial.materialName}</span>
                      <span>{inr(highestCostMaterial.cost)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 mt-4">
                  <div className="h-48 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Cost Contribution</span>
                    {mappedMaterials.length > 0 && (
                      <div className="relative h-40 w-40">
                         <Pie data={costChartData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                      </div>
                    )}
                  </div>
                  <div className="h-48 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Composition %</span>
                    {mappedMaterials.length > 0 && (
                      <div className="relative h-40 w-40">
                         <Pie data={compositionChartData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200">
             <div className="text-center text-slate-400">
               <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p className="font-bold text-sm">Select a grade from the library to view details</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
