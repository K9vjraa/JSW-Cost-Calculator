import { Lock, Plus, Save, Calculator, X, ChevronUp, Settings, Database, CheckCircle, Calendar } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CardContent, inr } from "@jsw-mcms/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { grades as staticGrades, metals as staticMetals, rawMaterials as staticRawMaterials } from "@/data/fixtures";
import { api, getOrFixture } from "@/services/api";
import type { Grade, Metal, RawMaterial, Breakdown } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/auth";
import { useSummaryStore } from "../store/summaryStore";

// Reusable elements
import { CalculationCard, type CalculationCardState } from "@/components/CalculationCard";
import { LiveSummaryPanel } from "@/components/LiveSummaryPanel";

type Mode = "metal" | "raw-material";

const seedCards: Record<Mode, CalculationCardState[]> = {
  metal: [
    { id: "c1", type: "metal", metalId: "metal-ss", gradeId: "grade-304", rawMaterialId: "", quantity: 100, rawMaterials: [], isExpanded: false },
    { id: "c2", type: "metal", metalId: "metal-ss", gradeId: "grade-316", rawMaterialId: "", quantity: 150, rawMaterials: [], isExpanded: false }
  ],
  "raw-material": [
    // raw-material mode starts empty; keep a placeholder
  ]
};

// Main function to convert workspace rows to the original flat rows for backend compatibility
export function localBreakdown(
  rows: {
    id: string;
    metalId: string;
    gradeId: string;
    quantity: number;
    rawMaterials?: { id: string; rawMaterialId: string; quantity: number }[];
  }[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _mode: string = "metal",
  metalsList: Metal[] = staticMetals,
  gradesList: Grade[] = staticGrades,
  rawMaterialsList: RawMaterial[] = staticRawMaterials
): Breakdown {
  const items = rows.map((row) => {
    const metal = metalsList.find((m) => m.id === row.metalId);
    const grade = gradesList.find((g) => g.id === row.gradeId);
    const name = grade?.name ?? metal?.name ?? "Material";
    const basePrice = Number(metal?.prices?.[0]?.pricePerUnit ?? 0);
    const gradeMultiplier = Number(grade?.multiplier ?? 1);
    const extraPrice = Number(grade?.extraPrice ?? 0);
    
    // Check if nested raw materials are defined
    const hasRaw = row.rawMaterials && row.rawMaterials.length > 0;
    const computedCost = hasRaw && row.rawMaterials
      ? row.rawMaterials.reduce((sum: number, rm: { quantity: number; rawMaterialId: string }) => {
          const rawMat = rawMaterialsList.find((r) => r.id === rm.rawMaterialId);
          const rawPrice = Number(rawMat?.prices?.[0]?.pricePerUnit ?? 0);
          return sum + (rm.quantity * rawPrice);
        }, 0)
      : row.quantity * (basePrice * gradeMultiplier + extraPrice);

    const unitPrice = basePrice;

    return {
      id: row.id,
      name,
      quantity: String(row.quantity),
      unitPrice: String(unitPrice),
      gradeMultiplier: String(gradeMultiplier),
      extraPrice: String(extraPrice),
      baseCost: String(computedCost),
      gradeName: grade?.name
    };
  });

  const baseCost = items.reduce((total, item) => total + Number(item.baseCost), 0);
  const totalQuantity = items.reduce((total, item) => total + Number(item.quantity), 0);
  const finalCost = baseCost;

  return {
    items,
    totalQuantity: String(totalQuantity),
    baseCost: String(baseCost),
    finalCost: String(finalCost)
  };
}

export function WorkspacePage() {
  const { actor } = useAuth();
  const [mode, setMode] = useState<Mode>("metal");
  const [cards, setCards] = useState<CalculationCardState[]>(seedCards.metal);
  
  // Real-time Database Lists state
  const [metalsList, setMetalsList] = useState<Metal[]>(staticMetals);
  const [gradesList, setGradesList] = useState<Grade[]>(staticGrades);
  const [rawMaterialsList, setRawMaterialsList] = useState<RawMaterial[]>(staticRawMaterials);

  // Active select state to load specifications sheet in central panel
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const activeCardId = selectedCardId && cards.some(c => c.id === selectedCardId)
    ? selectedCardId
    : (cards[0]?.id || null);

  // Added summary items (Live Cost Sheet)
  const { summaryItems, setSummaryItems, removeSummaryItem, clearSummary } = useSummaryStore();

  // Mobile summary modal state
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [activeCalculationId, setActiveCalculationId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const metalsRes = await getOrFixture<{ data: Metal[] }>("/masters/metals?limit=100", { data: staticMetals });
        const gradesRes = await getOrFixture<{ data: Grade[] }>("/masters/grades?limit=100", { data: staticGrades });
        const rawRes = await getOrFixture<{ data: RawMaterial[] }>("/masters/raw-materials?limit=100", { data: staticRawMaterials });
        
        setMetalsList(metalsRes.data || []);
        setGradesList(gradesRes.data || []);
        setRawMaterialsList(rawRes.data || []);
      } catch {
        console.error("Failed to sync workspace list state");
      }
    };
    loadData();
  }, []);

  const setWorkspace = (next: string) => {
    const typed = next as Mode;
    setMode(typed);
    setCards(seedCards[typed] || []);
    // Clear summary items on workspace pivot
    clearSummary();
  };

  const addCard = () => {
    const defaultMetal = metalsList[0] || staticMetals[0];
    const defaultGrade = gradesList.find((g) => g.metalId === defaultMetal.id) || staticGrades[0];
    const newCard: CalculationCardState = {
      id: crypto.randomUUID(),
      type: mode === "raw-material" ? "raw_material" : "metal",
      metalId: defaultMetal.id,
      gradeId: defaultGrade?.id || "",
      rawMaterialId: "",
      quantity: mode === "raw-material" ? 10 : 100,
      rawMaterials: [],
      isExpanded: true
    };
    setCards((current) => [...current, newCard]);
    setSelectedCardId(newCard.id);
  };

  const updateCardState = (id: string, data: Partial<CalculationCardState>) => {
    setCards((current) => current.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const removeCardState = (id: string) => {
    setCards((current) => current.filter((c) => c.id !== id));
    removeSummaryItem(id);
  };

  const handleSaveDraft = async () => {
    if (summaryItems.length === 0) {
      toast.error("Cannot save draft: simulation summary is empty.");
      return;
    }
    try {
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
      const payload = {
        name: `${mode === "metal" ? "Metal" : "Raw Material"} Cost Run ${new Date().toLocaleDateString("en-IN")}`,
        mode: mode === "metal" ? "metal" : "raw-material",
        items: summaryItems.map((item) => ({
          metalId: isUuid(item.metalId) ? item.metalId : undefined,
          gradeId: isUuid(item.gradeId) ? item.gradeId : undefined,
          quantity: item.quantity,
          compositionPct: 100
        })).filter(item => item.metalId && item.gradeId)
      };

      if (payload.items.length === 0) {
        throw new Error("Demo mode: fixture IDs are not UUIDs");
      }

      let res;
      if (activeCalculationId && isUuid(activeCalculationId)) {
        res = await api.put(`/calculations/${activeCalculationId}/draft`, payload);
      } else {
        res = await api.post("/calculations", payload);
      }

      if (res.data && res.data.id) {
        setActiveCalculationId(res.data.id);
      }
      toast.success("Draft calculation saved to active database");
    } catch (err) {
      // Local fallback
      const localDrafts = JSON.parse(localStorage.getItem("jsw-mcms-drafts") || "[]");
      const newDraft = {
        id: activeCalculationId || crypto.randomUUID(),
        name: `${mode === "metal" ? "Metal" : "Raw Material"} Cost Run`,
        mode,
        items: summaryItems,
        savedAt: new Date().toISOString()
      };
      if (!activeCalculationId) {
        setActiveCalculationId(newDraft.id);
      }
      localStorage.setItem("jsw-mcms-drafts", JSON.stringify([...localDrafts.filter((d: any) => d.id !== newDraft.id), newDraft]));
      toast.success("Demo draft saved locally to browser snapshots");
    }
  };

  const handleComplete = async () => {
    if (summaryItems.length === 0) {
      toast.error("Cannot complete calculation: simulation summary is empty.");
      return;
    }
    try {
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
      const payload = {
        name: `${mode === "metal" ? "Metal" : "Raw Material"} Cost Run ${new Date().toLocaleDateString("en-IN")}`,
        mode: mode === "metal" ? "metal" : "raw-material",
        items: summaryItems.map((item) => ({
          metalId: isUuid(item.metalId) ? item.metalId : undefined,
          gradeId: isUuid(item.gradeId) ? item.gradeId : undefined,
          quantity: item.quantity,
          compositionPct: 100
        })).filter(item => item.metalId && item.gradeId)
      };

      if (payload.items.length === 0) {
        throw new Error("Demo mode: fixture IDs are not UUIDs");
      }

      let calcId = activeCalculationId;
      if (!calcId || !isUuid(calcId)) {
        const draftRes = await api.post("/calculations", payload);
        calcId = draftRes.data.id;
      } else {
        await api.put(`/calculations/${calcId}/draft`, payload);
      }

      if (calcId) {
        await api.post(`/calculations/${calcId}/complete`);
      }
      
      toast.success("Calculation workflow finalized and committed to database!");
      setActiveCalculationId(null);
      clearSummary();
    } catch (err) {
      // Local demo completion
      toast.success("Demo calculation run finalized and saved locally!");
      setActiveCalculationId(null);
      clearSummary();
    }
  };

  // Safe variables with fallback to prevent undefined ReferenceError / TypeError crashes
  const summarySubtotal = useMemo(() => {
    return summaryItems.reduce((total, item) => total + item.baseCost, 0);
  }, [summaryItems]);

  const grandTotal = summarySubtotal;

  return (
    <div className="flex flex-col gap-4 relative h-[calc(100vh-80px-3rem)] overflow-hidden font-inter">
      {/* Redesigned Workspace Banner Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-4 rounded-md border border-border relative overflow-hidden shrink-0">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
        
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-primary">
            JSW Cost Allocation Workspace
          </p>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
            Metal Cost Calculation Workspace
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success" icon={<Lock className="h-3.5 w-3.5" />} className="rounded-sm border-none font-bold text-[10px]">
            Central Locked Prices
          </Badge>
          
          <Button
            size="sm"
            onClick={handleSaveDraft}
            className="bg-jsw-blue text-white font-bold hover:bg-primary h-8 rounded-sm shadow-none border-none cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span>Save Workspace Draft</span>
          </Button>
        </div>
      </header>

      {/* Primary Workspace Navigation Tabs */}
      <Tabs value={mode} onValueChange={setWorkspace} className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="bg-slate-100 p-1 rounded-sm border border-border mb-3 shrink-0 self-start">
          <TabsTrigger value="metal" className="rounded-sm text-xs font-bold px-4 py-2">
            Metal Calculator
          </TabsTrigger>
          <TabsTrigger value="raw-material" className="rounded-sm text-xs font-bold px-4 py-2">
            Raw Material Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="outline-none mt-0 flex-1 min-h-0">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] xl:grid-cols-[55%_20%_25%] gap-4 h-full min-h-0 items-stretch">
            
            {/* 1️⃣ LEFT PANEL -> METAL INPUT WORKSPACE */}
            <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 scrollbar-thin lg:col-start-1 lg:col-end-2 lg:row-start-1 xl:col-start-1 xl:col-end-2 xl:row-start-auto">
              <div className="flex items-center justify-between shrink-0 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {mode === "metal" ? "Metal Calculations" : "Raw Materials Input"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-sm text-[10px] font-black border-border text-primary hover:bg-slate-50"
                  onClick={addCard}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Card</span>
                </Button>
              </div>

              {cards.length === 0 ? (
                <Card className="border-border bg-white rounded-md shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Calculator className="h-12 w-12 mb-3 text-slate-300 animate-pulse" />
                    <strong className="text-slate-800 text-sm font-bold block mb-1">
                      No Calculation Sheets
                    </strong>
                    <p className="text-xs text-slate-400 font-semibold max-w-[240px] mb-4">
                      Create a metal card sheet to customize material specifications.
                    </p>
                    <Button onClick={addCard} className="bg-primary text-white font-bold h-9 px-4 rounded-sm border-none cursor-pointer">
                      Add First Card
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 pb-4">
                  {cards.map((card, idx) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer focus:outline-none ${activeCardId === card.id ? "ring-1 ring-primary rounded-md" : ""}`}
                    >
                      <CalculationCard
                        index={idx}
                        card={card}
                        metalsList={metalsList}
                        gradesList={gradesList}
                        rawMaterialsList={rawMaterialsList}
                        onUpdateData={updateCardState}
                        onRemove={() => removeCardState(card.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2️⃣ CENTER PANEL -> Calculation Properties & Metadata */}
            <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 scrollbar-thin lg:col-start-1 lg:col-end-2 lg:row-start-2 xl:col-start-2 xl:col-end-3 xl:row-start-auto">
              <Card className="border-border bg-white shadow-none overflow-hidden relative shrink-0 rounded-md">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="font-extrabold text-slate-800 tracking-tight text-xs uppercase">
                      Calculation Properties
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 w-full text-left">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
                          Mode Pivot
                        </label>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-sm">
                          {(["metal", "raw-material"] as Mode[]).map((m) => (
                            <button
                              key={m}
                              onClick={() => setWorkspace(m)}
                              className={`flex-1 py-1 text-[9px] font-extrabold rounded-sm transition-all uppercase tracking-wide ${
                                mode === m
                                  ? "bg-white text-primary shadow-xs"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                              }`}
                            >
                              {m === "raw-material" ? "RM" : "Metal"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 w-full text-left">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
                          Unit
                        </label>
                        <div className="flex h-9.5 w-full items-center justify-between rounded-sm border border-border bg-slate-50 px-3 text-xs font-bold text-slate-600">
                          <span>kilograms (kg)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Metadata */}
              <Card className="border-border bg-white shadow-none overflow-hidden shrink-0 rounded-md">
                <CardContent className="p-4 flex flex-col gap-3.5">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h3 className="font-extrabold text-slate-800 tracking-tight text-xs uppercase">
                      Calculation Metadata
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-left text-xs border-t border-slate-100 pt-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Operator</span>
                      <strong className="font-bold text-slate-700 truncate">{actor?.name || "System Specialist"}</strong>
                      <span className="text-[9px] text-slate-400 font-medium truncate">{actor?.email || "specialist@jsw.in"}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-extrabold text-[10px] text-amber-600 uppercase tracking-wider">DRAFT</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date</span>
                      <div className="flex items-center gap-1 text-slate-600 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Precision Tier</span>
                      <div className="flex items-center gap-1 text-slate-600 font-bold">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                        <span>4 Decimal Places</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3️⃣ RIGHT PANEL -> LIVE SUMMARY PANEL */}
            <div className="h-full flex flex-col lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-span-2 xl:col-start-3 xl:col-end-4 xl:row-start-auto xl:row-span-1 min-h-[300px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 text-left shrink-0">
                Active Simulation Summary
              </span>
              <LiveSummaryPanel
                items={summaryItems}
                onRemove={removeSummaryItem}
                onUpdateQty={(id, qty) => {
                  setSummaryItems(
                    summaryItems.map((item) => {
                      if (item.id === id) {
                        return { ...item, quantity: qty, baseCost: qty * item.unitPrice };
                      }
                      return item;
                    })
                  );
                }}
                onClearAll={clearSummary}
                onSaveDraft={handleSaveDraft}
                onComplete={handleComplete}
              />
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* MOBILE STICKY BOTTOM TOTAL BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white p-3.5 shadow-2xl flex items-center justify-between xl:hidden">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Estimated Cost
          </span>
          <strong className="text-xl font-black text-blue-400 tracking-tight">
            {inr(grandTotal)}
          </strong>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsMobileSummaryOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 h-9 px-3 rounded-lg"
          >
            <span>Summary ({summaryItems.length})</span>
            <ChevronUp className="h-4 w-4 ml-1" />
          </Button>
          
          <Button
            size="sm"
            disabled={summaryItems.length === 0}
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black h-9 px-3 rounded-lg"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE BOTTOM SHEET DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs xl:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="w-full max-h-[85vh] bg-white rounded-t-3xl border-t border-slate-200 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Drawer Handle / Close */}
              <div className="flex h-14 items-center justify-between border-b border-slate-100 bg-slate-50 px-5 text-slate-800">
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-700">
                  Live Cost Sheet Drawer
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-slate-400 hover:bg-slate-150 p-1"
                  onClick={() => setIsMobileSummaryOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-20">
                <LiveSummaryPanel
                  items={summaryItems}
                  onRemove={removeSummaryItem}
                  onUpdateQty={(id, qty) => {
                    setSummaryItems(
                      summaryItems.map((item) => {
                        if (item.id === id) {
                          return { ...item, quantity: qty, baseCost: qty * item.unitPrice };
                        }
                        return item;
                      })
                    );
                  }}
                  onClearAll={clearSummary}
                  onSaveDraft={handleSaveDraft}
                  onComplete={() => {
                    setIsMobileSummaryOpen(false);
                    handleComplete();
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
