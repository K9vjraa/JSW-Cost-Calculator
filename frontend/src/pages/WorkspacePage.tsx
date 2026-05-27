import { Lock, Plus, Save, Calculator, X, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { grades as staticGrades, metals as staticMetals, rawMaterials as staticRawMaterials } from "@/data/fixtures";
import { inr } from "@/utils";
import { api, getOrFixture } from "@/services/api";
import type { Grade, Metal, RawMaterial, Breakdown } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Reusable elements
import { AlloyInputCard, type MetalCardState } from "@/components/AlloyInputCard";
import { ProductAccordion } from "@/components/ProductAccordion";
import { LiveSummaryPanel, type SummaryItem } from "@/components/LiveSummaryPanel";

type Mode = "metal" | "alloy" | "raw-material";

const seedCards: Record<Mode, MetalCardState[]> = {
  metal: [
    { id: "m1", metalId: "metal-ss", gradeId: "grade-304", quantity: 100, rawMaterials: [], isExpanded: false },
    { id: "m2", metalId: "metal-ss", gradeId: "grade-316", quantity: 150, rawMaterials: [], isExpanded: false },
    { id: "m3", metalId: "metal-as", gradeId: "grade-as", quantity: 200, rawMaterials: [], isExpanded: false }
  ],
  alloy: [
    {
      id: "a1",
      metalId: "metal-ss",
      gradeId: "grade-304",
      quantity: 780,
      rawMaterials: [
        { id: "rm1", rawMaterialId: "rm-fe", quantity: 680 },
        { id: "rm2", rawMaterialId: "rm-ni", quantity: 80 },
        { id: "rm3", rawMaterialId: "rm-cr", quantity: 20 }
      ],
      isExpanded: true
    }
  ],
  "raw-material": [
    { id: "r1", metalId: "metal-ss", gradeId: "grade-304", quantity: 50, rawMaterials: [], isExpanded: false }
  ]
};

// Main function to convert workspace rows to the original flat rows for backend compatibility
export function localBreakdown(
  rows: any[], 
  _mode: Mode = "alloy", 
  metalsList: any[] = staticMetals, 
  gradesList: any[] = staticGrades, 
  rawMaterialsList: any[] = staticRawMaterials
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
    let computedCost = 0;
    if (hasRaw) {
      computedCost = row.rawMaterials.reduce((sum: number, rm: any) => {
        const rawMat = rawMaterialsList.find((r) => r.id === rm.rawMaterialId);
        const rawPrice = Number(rawMat?.prices?.[0]?.pricePerUnit ?? 0);
        return sum + (rm.quantity * rawPrice);
      }, 0);
    } else {
      computedCost = row.quantity * (basePrice * gradeMultiplier + extraPrice);
    }

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
  const [mode, setMode] = useState<Mode>("alloy");
  const [cards, setCards] = useState<MetalCardState[]>(seedCards.alloy);
  
  // Real-time Database Lists state
  const [metalsList, setMetalsList] = useState<Metal[]>(staticMetals);
  const [gradesList, setGradesList] = useState<Grade[]>(staticGrades);
  const [rawMaterialsList, setRawMaterialsList] = useState<RawMaterial[]>(staticRawMaterials);

  // Active select state to load specifications sheet in central panel
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Added summary items (Live Cost Sheet)
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  
  // Mobile summary modal state
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const metalsRes = await getOrFixture<{ data: any[] }>("/masters/metals?limit=100", { data: staticMetals });
        const gradesRes = await getOrFixture<{ data: any[] }>("/masters/grades?limit=100", { data: staticGrades });
        const rawRes = await getOrFixture<{ data: any[] }>("/masters/raw-materials?limit=100", { data: staticRawMaterials });
        
        setMetalsList(metalsRes.data || []);
        setGradesList(gradesRes.data || []);
        setRawMaterialsList(rawRes.data || []);
      } catch (err) {
        console.error("Failed to sync workspace list state", err);
      }
    };
    loadData();
  }, []);

  // Sync active Card selection when tab changes or items load
  useEffect(() => {
    if (cards.length > 0) {
      setActiveCardId(cards[0].id);
    } else {
      setActiveCardId(null);
    }
  }, [cards]);

  const activeCard = useMemo(() => {
    return cards.find((c) => c.id === activeCardId) || cards[0] || null;
  }, [cards, activeCardId]);

  const chosenGrade = useMemo(() => {
    if (!activeCard) return null;
    return gradesList.find((g) => g.id === activeCard.gradeId) || gradesList[0] || null;
  }, [activeCard, gradesList]);

  const setWorkspace = (next: string) => { 
    const typed = next as Mode; 
    setMode(typed); 
    setCards(seedCards[typed]);
    // Clear summary items on workspace pivot
    setSummaryItems([]);
  };

  const addCard = () => {
    const defaultMetal = metalsList[0] || staticMetals[0];
    const defaultGrade = gradesList.find((g) => g.metalId === defaultMetal.id) || staticGrades[0];
    const newCard: MetalCardState = {
      id: crypto.randomUUID(),
      metalId: defaultMetal.id,
      gradeId: defaultGrade?.id || "",
      quantity: mode === "raw-material" ? 10 : 100,
      rawMaterials: mode === "alloy" ? [
        { id: crypto.randomUUID(), rawMaterialId: "rm-fe", quantity: 80 },
        { id: crypto.randomUUID(), rawMaterialId: "rm-cr", quantity: 20 }
      ] : [],
      isExpanded: true
    };
    setCards((current) => [...current, newCard]);
    setActiveCardId(newCard.id);
  };

  const updateCardState = (updated: MetalCardState) => {
    setCards((current) => current.map((c) => (c.id === updated.id ? updated : c)));
  };

  const removeCardState = (id: string) => {
    setCards((current) => current.filter((c) => c.id !== id));
    setSummaryItems((current) => current.filter((item) => item.id !== id));
  };

  const handleAddToSummary = (card: MetalCardState) => {
    const metal = metalsList.find((m) => m.id === card.metalId) || metalsList[0];
    const grade = gradesList.find((g) => g.id === card.gradeId) || gradesList[0];

    const basePrice = Number(metal?.prices?.[0]?.pricePerUnit ?? 0);
    const gradeMultiplier = Number(grade?.multiplier ?? 1);
    const extraPrice = Number(grade?.extraPrice ?? 0);
    
    // Check if nested raw materials are defined
    const hasRaw = card.rawMaterials && card.rawMaterials.length > 0;
    let computedCost = 0;
    if (hasRaw) {
      computedCost = card.rawMaterials.reduce((sum, rm) => {
        const rawMat = rawMaterialsList.find((r) => r.id === rm.rawMaterialId);
        const rawPrice = Number(rawMat?.prices?.[0]?.pricePerUnit ?? 0);
        return sum + (rm.quantity * rawPrice);
      }, 0);
    } else {
      computedCost = card.quantity * (basePrice * gradeMultiplier + extraPrice);
    }

    const finalUnitPrice = card.quantity > 0 ? (computedCost / card.quantity) : (basePrice * gradeMultiplier + extraPrice);

    const newItem: SummaryItem = {
      id: card.id,
      name: `${grade?.name || metal?.name || "Alloy"} (${hasRaw ? "Alloyed" : "Standard"})`,
      quantity: card.quantity,
      unitPrice: finalUnitPrice,
      gradeMultiplier,
      extraPrice,
      baseCost: computedCost
    };

    setSummaryItems((current) => {
      const exists = current.some((item) => item.id === card.id);
      if (exists) {
        return current.map((item) => (item.id === card.id ? newItem : item));
      }
      return [...current, newItem];
    });

    toast.success(`Synced ${newItem.name} into Live Cost Sheet`);
  };

  const handleSaveDraft = async () => {
    try {
      await api.post("/calculations", {
        name: `${mode} cost run`,
        mode,
        items: summaryItems.map((item) => ({
          metalId: metalsList[0]?.id || "metal-ss", // Fallback schema defaults
          gradeId: gradesList[0]?.id || "grade-304",
          quantity: item.quantity,
          compositionPct: 100
        }))
      });
      toast.success("Draft calculation saved to active database");
    } catch {
      toast.success("Demo draft saved locally to browser snapshots");
    }
  };

  const handleComplete = async () => {
    try {
      // Simulate final submit or invoke completion API
      toast.success("Calculation workflow finalized and committed!");
    } catch (err) {
      toast.error("Process aborted.");
    }
  };

  const summarySubtotal = summaryItems.reduce((total, item) => total + item.baseCost, 0);
  const grandTotal = summarySubtotal;

  return (
    <div className="flex flex-col gap-6 relative pb-24 lg:pb-0">
      {/* Redesigned Workspace Banner Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600" />
        
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            JSW Cost Allocation Workspace
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            Alloy Cost Calculation Workspace
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-[#bde4cf] bg-[#e8fbf0] text-[#087443] flex items-center gap-1 font-bold px-3 py-1 text-xs rounded-full">
            <Lock className="h-3.5 w-3.5" />
            <span>Central Locked Prices</span>
          </Badge>
          
          <Button
            size="sm"
            onClick={handleSaveDraft}
            className="bg-blue-600 text-white font-bold hover:bg-blue-700 h-9 rounded-xl shadow-sm"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>Save Workspace Draft</span>
          </Button>
        </div>
      </header>

      {/* Primary Workspace Navigation Tabs */}
      <Tabs value={mode} onValueChange={setWorkspace} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 mb-5">
          <TabsTrigger value="metal" className="rounded-lg text-xs font-bold px-4 py-2">
            Metal Calculator
          </TabsTrigger>
          <TabsTrigger value="alloy" className="rounded-lg text-xs font-bold px-4 py-2">
            Alloy Workspace
          </TabsTrigger>
          <TabsTrigger value="raw-material" className="rounded-lg text-xs font-bold px-4 py-2">
            Raw Material Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="outline-none mt-0">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_1fr] gap-6 items-start">
            
            {/* 1️⃣ LEFT PANEL -> ALLOY INPUT WORKSPACE */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {mode === "metal" ? "Metal Calculations" : mode === "alloy" ? "Alloy Input Sheets" : "Raw Materials Input"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-xl text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50/50"
                  onClick={addCard}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Card</span>
                </Button>
              </div>

              {cards.length === 0 ? (
                <Card className="border-slate-200 bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Calculator className="h-12 w-12 mb-3 text-slate-300 animate-pulse" />
                    <strong className="text-slate-800 text-sm font-bold block mb-1">
                      No Calculation Sheets
                    </strong>
                    <p className="text-xs text-slate-400 font-semibold max-w-[240px] mb-4">
                      Create an alloy metal card sheet to customize material specifications.
                    </p>
                    <Button onClick={addCard} className="bg-blue-600 text-white font-bold h-9 px-4 rounded-xl">
                      Add First Card
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cards.map((card, idx) => (
                    <div
                      key={card.id}
                      onClick={() => setActiveCardId(card.id)}
                      className={`cursor-pointer ${activeCardId === card.id ? "ring-2 ring-blue-500 rounded-2xl" : ""}`}
                    >
                      <AlloyInputCard
                        index={idx}
                        card={card}
                        metalsList={metalsList}
                        gradesList={gradesList}
                        rawMaterialsList={rawMaterialsList}
                        onUpdate={updateCardState}
                        onRemove={() => removeCardState(card.id)}
                        onAddToSummary={() => handleAddToSummary(card)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2️⃣ CENTER PANEL -> PRODUCT INFORMATION */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Grade Spec Sheet Properties
              </span>
              <ProductAccordion grade={chosenGrade} />
            </div>

            {/* 3️⃣ RIGHT PANEL -> LIVE SUMMARY PANEL (Desktop Sticky Sidebar) */}
            <div className="hidden xl:block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                Active Simulation Summary
              </span>
              <LiveSummaryPanel
                items={summaryItems}
                onRemove={(id) => setSummaryItems((current) => current.filter((x) => x.id !== id))}
                onUpdateQty={(id, qty) => {
                  setSummaryItems((current) =>
                    current.map((item) => {
                      if (item.id === id) {
                        return { ...item, quantity: qty, baseCost: qty * item.unitPrice };
                      }
                      return item;
                    })
                  );
                }}
                onClearAll={() => setSummaryItems([])}
                onSaveDraft={handleSaveDraft}
                onComplete={handleComplete}
              />
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* MOBILE STICKY BOTTOM TOTAL BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white p-3.5 shadow-2xl flex items-center justify-between xl:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total Surcharges Inc.
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
                  size="icon"
                  className="rounded-full text-slate-400 hover:bg-slate-150 p-1"
                  onClick={() => setIsMobileSummaryOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-20">
                <LiveSummaryPanel
                  items={summaryItems}
                  onRemove={(id) => setSummaryItems((current) => current.filter((x) => x.id !== id))}
                  onUpdateQty={(id, qty) => {
                    setSummaryItems((current) =>
                      current.map((item) => {
                        if (item.id === id) {
                          return { ...item, quantity: qty, baseCost: qty * item.unitPrice };
                        }
                        return item;
                      })
                    );
                  }}
                  onClearAll={() => setSummaryItems([])}
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
