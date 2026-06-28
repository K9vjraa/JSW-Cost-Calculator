import { Lock, Plus, Save, Calculator, X, ChevronUp, Settings, Database, CheckCircle, Search, Copy, Download, ChevronDown, FileText, FileSpreadsheet, Layers } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CardContent, inr } from "@jsw-mcms/ui";
import { exportToPDF, exportToExcel, exportToCSV } from "@/utils/exportUtils";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/services/api";
import type { Grade, Metal, RawMaterial, Breakdown } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/auth";
import { useWorkspaceStore } from "../store/workspaceStore";

import { CalculationCard, type CalculationCardState } from "@/components/CalculationCard";
import { LiveSummaryPanel } from "@/components/LiveSummaryPanel";
import { GradeBuilderWorkspace } from "@/components/GradeBuilder/GradeBuilderWorkspace";
import { GradeWorkflowStepper } from "@/components/GradeBuilder/GradeWorkflowStepper";
import { useGradeBuilderStore } from "@/store/gradeBuilderStore";
import { useRawMaterials } from "@/services/materialRatesApi";
import { calculateWorkspaceTotals } from "@/utils/calculations";
import { useLatestDraftQuery } from "@/services/api/calculation.api";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type Mode = "metal" | "raw-material" | "grade-builder";

const seedCards: Record<Mode, CalculationCardState[]> = {
  metal: [
    { id: "c1", type: "metal", metalId: "metal-ss", gradeId: "grade-304", rawMaterialId: "", quantity: 100, rawMaterials: [], isExpanded: false },
    { id: "c2", type: "metal", metalId: "metal-ss", gradeId: "grade-316", rawMaterialId: "", quantity: 150, rawMaterials: [], isExpanded: false }
  ],
  "raw-material": [
    // raw-material mode starts empty; keep a placeholder
  ],
  "grade-builder": []
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
  metalsList: Metal[] = [],
  gradesList: Grade[] = [],
  rawMaterialsList: RawMaterial[] = []
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
          const rawPrice = Number((rawMat as any)?.currentRate ?? rawMat?.prices?.[0]?.pricePerUnit ?? 0);
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

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  lastUpdated?: string;
  isLoading?: boolean;
  onClick?: () => void;
  isHero?: boolean;
}

function KPICard({
  label,
  value,
  subtext,
  trend,
  lastUpdated,
  isLoading,
  onClick,
  isHero = false,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={`border rounded-sm bg-white p-3 shadow-sm h-16 flex flex-col justify-between ${isHero ? "border-l-4 border-l-[#1A365D]" : "border-slate-200"} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-2 w-32 bg-slate-100 rounded" />
      </Card>
    );
  }

  const hasTrend = !!trend;
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? "button" : undefined}
      aria-label={`${label} metric`}
      className={`transition-colors duration-200 ease-in-out select-none focus-visible:ring-2 focus-visible:ring-[#1A365D] focus-visible:outline-none ${
        isHero
          ? "border-l-4 border-l-[#1A365D] border-y border-r border-slate-200 bg-white"
          : "border border-slate-200 bg-white"
      } ${
        isClickable
          ? "cursor-pointer hover:border-[#1A365D]/40 hover:shadow-sm"
          : ""
      }`}
    >
      <CardContent className="p-3 flex flex-col justify-between h-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              {label}
            </span>
            {hasTrend && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                trend.type === "up"
                  ? "bg-emerald-50 text-emerald-700"
                  : trend.type === "down"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {trend.type === "up" ? "↑" : trend.type === "down" ? "↓" : "—"} {trend.value}
                <span className="sr-only">Trend: {trend.type === "up" ? "increased by" : trend.type === "down" ? "decreased by" : "stable at"} {trend.value}</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`font-black tracking-tight font-mono ${
              isHero ? "text-lg text-[#1A365D]" : "text-sm text-slate-800"
            }`}>
              {value}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-400 font-medium">
          <span className="truncate max-w-[70%]">{subtext}</span>
          {lastUpdated && <span className="shrink-0">{lastUpdated}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function GradeBuilderStepperWrapper() {
  const { selectedGradeId, draftGrade, materials } = useGradeBuilderStore();
  
  // Need to get grades from somewhere, but to avoid circular deps or extra queries just use basic state
  const isNewGrade = !selectedGradeId;
  const statusLabel = isNewGrade ? 'NEW DRAFT' : 'DRAFT'; // Simplified since we don't fetch all grades here

  const totalPct = materials.reduce((sum, m) => sum + (Number(m.compositionPercent) || 0), 0);
  const isCompositionValid = Math.abs(totalPct - 100) < 0.01;

  const currentStep = 
    (!draftGrade.name || !draftGrade.code) ? 1 : 
    (materials.length === 0) ? 2 : 
    (!isCompositionValid) ? 3 : 
    4;

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm shrink-0 flex items-center justify-center -mt-2">
      <GradeWorkflowStepper 
        currentStep={currentStep}
        isSubmitted={false}
      />
    </div>
  );
}

export function WorkspacePage() {
  const { actor } = useAuth();
  const { 
    mode, 
    setMode, 
    cards = [], 
    setCards, 
    selectedCardId, 
    setSelectedCardId, 
    summaryItems = [], 
    setSummaryItems,
    removeSummaryItem,
    clearSummary,
    activeCalculationId,
    setActiveCalculationId,
    lastSavedAt,
    setLastSavedAt,
    workflowStatus,
    setWorkflowStatus
  } = useWorkspaceStore();

  // Real-time Database Lists state
  const [metalsList, setMetalsList] = useState<Metal[]>([]);
  const [gradesList, setGradesList] = useState<Grade[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search states and debouncing
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Card count state tracking across modes
  const [metalCardsCount, setMetalCardsCount] = useState(seedCards.metal.length);
  const [rawMaterialCardsCount, setRawMaterialCardsCount] = useState(seedCards["raw-material"].length);

  useEffect(() => {
    if (mode === "metal") {
      setMetalCardsCount(cards.length);
    } else if (mode === "raw-material") {
      setRawMaterialCardsCount(cards.length);
    }
  }, [cards, mode]);

  const activeCardId = selectedCardId && cards.some(c => c.id === selectedCardId)
    ? selectedCardId
    : (cards[0]?.id || null);

  // Mobile summary modal state
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const metalsRes = await api.get<{ data: Metal[] }>("/metals?limit=100");
        const gradesRes = await api.get<{ data: Grade[] }>("/grades?limit=100");
        
        setMetalsList(metalsRes.data?.data || []);
        setGradesList(gradesRes.data?.data || []);
      } catch {
        console.error("Failed to sync workspace list state");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { data: latestDraft } = useLatestDraftQuery();

  // Restore session from server
  useEffect(() => {
    if (latestDraft && (latestDraft as any).snapshot?.clientState && !activeCalculationId && cards.length === 0) {
      const { clientState } = (latestDraft as any).snapshot;
      if (clientState.cards) setCards(clientState.cards);
      if (clientState.summaryItems) setSummaryItems(clientState.summaryItems);
      if (clientState.mode) setMode(clientState.mode);
      if (clientState.orderQuantity) useWorkspaceStore.getState().setOrderQuantity(clientState.orderQuantity);
      if (clientState.comparisonSelections) useWorkspaceStore.getState().setComparisonSelections(clientState.comparisonSelections);
      setActiveCalculationId(latestDraft.id);
      toast.success("Previous session restored from server");
    }
  }, [latestDraft, activeCalculationId, cards.length, setCards, setSummaryItems, setMode, setActiveCalculationId]);

  // Use React Query for raw materials
  const { data: rawMaterialsData = [] } = useRawMaterials();
  const rawMaterialsList = rawMaterialsData as unknown as RawMaterial[]; // Cast back to RawMaterial to maintain type compatibility with fixtures if needed

  const filteredCards = useMemo(() => {
    if (!debouncedQuery.trim()) return cards;
    
    const q = debouncedQuery.toLowerCase().trim();
    
    return cards.filter((card) => {
      // 1. Calculation ID
      if (card.id.toLowerCase().includes(q)) return true;
      
      // 2. Material (Metal name)
      const metal = metalsList.find((m) => m.id === card.metalId || m.name.toLowerCase().includes(q));
      if (metal?.name.toLowerCase().includes(q)) return true;
      
      // 3. Grade
      const grade = gradesList.find((g) => g.id === card.gradeId || g.name.toLowerCase() === (card.gradeName || "").toLowerCase());
      if (grade?.name.toLowerCase().includes(q)) return true;
      
      // 4. Recipe (ingredients names)
      if (card.rawMaterials && card.rawMaterials.length > 0) {
        const hasRmMatch = card.rawMaterials.some((rm) => {
          const raw = rawMaterialsList.find((r) => r.id === rm.rawMaterialId);
          return raw?.name?.toLowerCase().includes(q) || raw?.alloyName?.toLowerCase().includes(q);
        });
        if (hasRmMatch) return true;
      }
      
      return false;
    });
  }, [cards, debouncedQuery, metalsList, gradesList, rawMaterialsList]);

  const setWorkspace = (next: string) => {
    const typed = next as Mode;
    setMode(typed as any);
    setCards(seedCards[typed] || []);
    // Clear summary items on workspace pivot
    clearSummary();
  };

  const addCard = () => {
    const defaultMetal = metalsList[0];
    const defaultGrade = defaultMetal ? gradesList.find((g) => g.metalId === defaultMetal.id) : gradesList[0];
    const newCard: CalculationCardState = {
      id: crypto.randomUUID(),
      type: mode === "raw-material" ? "raw_material" : mode === "grade-builder" ? "grade_builder" : "metal",
      metalId: defaultMetal.id,
      gradeId: defaultGrade?.id || "",
      rawMaterialId: "",
      quantity: mode === "raw-material" ? 10 : mode === "grade-builder" ? 1000 : 100,
      rawMaterials: [],
      isExpanded: true
    };
    useWorkspaceStore.getState().addCard(newCard);
    setSelectedCardId(newCard.id);
  };

  const updateCardState = (id: string, data: Partial<CalculationCardState>) => {
    useWorkspaceStore.getState().updateCard(id, data);
  };

  const removeCardState = (id: string) => {
    useWorkspaceStore.getState().removeCard(id);
  };

  const handleSaveDraft = async (isAutoSave = false) => {
    if (summaryItems.length === 0) {
      if (!isAutoSave) toast.error("Cannot save draft: simulation summary is empty.");
      return;
    }
    if (!isAutoSave) setIsSaving(true);
    try {
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
      const payload = {
        name: `${mode === "metal" ? "Metal" : mode === "grade-builder" ? "Grade Builder" : "Raw Material"} Cost Run ${new Date().toLocaleDateString("en-IN")}`,
        mode: mode,
        items: summaryItems.map((item) => ({
          metalId: isUuid(item.metalId) ? item.metalId : undefined,
          gradeId: isUuid(item.gradeId) ? item.gradeId : undefined,
          quantity: item.quantity,
          compositionPct: 100,
          name: mode === "raw-material" || mode === "grade-builder" ? item.name : undefined,
          unitPrice: mode === "raw-material" || mode === "grade-builder" ? item.unitPrice : undefined,
          baseCost: mode === "raw-material" || mode === "grade-builder" ? item.baseCost : undefined
        })).filter(item => mode === "raw-material" || mode === "grade-builder" || (item.metalId || item.gradeId)),
        clientState: {
          cards: useWorkspaceStore.getState().cards,
          mode: useWorkspaceStore.getState().mode,
          orderQuantity: useWorkspaceStore.getState().orderQuantity,
          comparisonSelections: useWorkspaceStore.getState().comparisonSelections,
          summaryItems: useWorkspaceStore.getState().summaryItems,
        }
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
      setLastSavedAt(new Date().toISOString());
      if (!isAutoSave) toast.success("Draft calculation saved to active database");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save to database. Saving locally.");
      // Local fallback
      const localDrafts = JSON.parse(localStorage.getItem("jsw-mcms-drafts") || "[]");
      const newDraft = {
        id: activeCalculationId || crypto.randomUUID(),
        name: `${mode === "metal" ? "Metal" : mode === "grade-builder" ? "Grade Builder" : "Raw Material"} Cost Run`,
        mode,
        items: summaryItems,
        savedAt: new Date().toISOString()
      };
      if (!activeCalculationId) {
        setActiveCalculationId(newDraft.id);
      }
      localStorage.setItem("jsw-mcms-drafts", JSON.stringify([...localDrafts.filter((d: any) => d.id !== newDraft.id), newDraft]));
      setLastSavedAt(new Date().toISOString());
      if (!isAutoSave) toast.success("Draft saved locally.");
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const handleDuplicateSelected = () => {
    if (!activeCardId) {
      toast.error("No active sheet selected to duplicate");
      return;
    }
    const cardToDuplicate = cards.find(c => c.id === activeCardId);
    if (!cardToDuplicate) return;
    const duplicatedCard: CalculationCardState = {
      ...cardToDuplicate,
      id: crypto.randomUUID(),
      isExpanded: true
    };
    useWorkspaceStore.getState().addCard(duplicatedCard);
    setSelectedCardId(duplicatedCard.id);
    toast.success("Sheet duplicated successfully");
  };

  const handleCalculateAll = () => {
    toast.success("Recalculating costing models based on latest master rates");
  };

  // Auto-Save Effect
  useEffect(() => {
    if (summaryItems.length === 0) return;
    const interval = setInterval(() => {
      handleSaveDraft(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [summaryItems, mode, cards]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (summaryItems.length > 0) {
          handleSaveDraft(false);
        } else {
          toast.error("Cannot save draft: simulation summary is empty.");
        }
      } else if (isCtrl && e.key === "Enter") {
        e.preventDefault();
        handleCalculateAll();
      } else if (isCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (activeCardId) {
          handleDuplicateSelected();
        } else {
          toast.error("No active sheet selected to duplicate");
        }
      } else if (isCtrl && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addCard();
      } else if (e.key === "Escape") {
        setIsExportOpen(false);
        setIsMobileSummaryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [summaryItems, activeCardId, mode, cards, activeCalculationId, isExportOpen, isMobileSummaryOpen]);

  const handleComplete = async () => {
    if (summaryItems.length === 0) {
      toast.error("Cannot complete calculation: simulation summary is empty.");
      return;
    }
    setIsSaving(true);
    try {
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
      const payload = {
        name: `${mode === "metal" ? "Metal" : mode === "grade-builder" ? "Grade Builder" : "Raw Material"} Cost Run ${new Date().toLocaleDateString("en-IN")}`,
        mode: mode,
        items: summaryItems.map((item) => ({
          metalId: isUuid(item.metalId) ? item.metalId : undefined,
          gradeId: isUuid(item.gradeId) ? item.gradeId : undefined,
          quantity: item.quantity,
          compositionPct: 100,
          name: mode === "raw-material" || mode === "grade-builder" ? item.name : undefined,
          unitPrice: mode === "raw-material" || mode === "grade-builder" ? item.unitPrice : undefined,
          baseCost: mode === "raw-material" || mode === "grade-builder" ? item.baseCost : undefined
        })).filter(item => mode === "raw-material" || mode === "grade-builder" || (item.metalId || item.gradeId))
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
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to complete calculation workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  // Safe variables with fallback to prevent undefined ReferenceError / TypeError crashes
  const summarySubtotal = useMemo(() => {
    return summaryItems.reduce((total, item) => total + item.baseCost, 0);
  }, [summaryItems]);

  const grandTotal = summarySubtotal;

  const summaryTotalQty = useMemo(() => {
    return summaryItems.reduce((total, item) => total + item.quantity, 0);
  }, [summaryItems]);

  const currentStep = useMemo(() => {
    if (cards.length === 0) return 1; // Step 1: Select Grade
    
    const activeCard = cards.find(c => c.id === activeCardId);
    if (!activeCard || !activeCard.gradeId) return 1; // Step 1: Select Grade
    
    // If card exists but is not added to the summary ledger
    const isAddedToSummary = summaryItems.some(item => item.id === activeCardId);
    if (!isAddedToSummary) {
      return 2; // Step 2: Configure Recipe
    }
    
    // If added to summary but no draft saved yet
    if (!lastSavedAt) {
      return 3; // Step 3: Calculate
    }
    
    // If draft saved, we are in review phase
    if (lastSavedAt && workflowStatus !== "Submitted") {
      return 4; // Step 4: Review
    }
    
    return 5; // Step 5: Submit
  }, [cards, activeCardId, summaryItems, lastSavedAt, workflowStatus]);

  // New Global Workspace Totals (over all cards)
  const { workspaceTotal, totalQuantity, averageCostPerKg } = useMemo(() => {
    return calculateWorkspaceTotals(cards, metalsList, gradesList, rawMaterialsList);
  }, [cards, metalsList, gradesList, rawMaterialsList]);

  return (
    <div className="flex flex-col gap-2 relative h-[calc(100vh-80px-3rem)] overflow-hidden font-inter bg-slate-50 p-2">
      
      {/* Top Header */}
      <div className="flex flex-col gap-1 shrink-0">
        <header className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-sm border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
          <div className="flex items-center flex-wrap gap-1">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addCard}
                    className="h-8 gap-1.5 px-3 text-[#1A365D] hover:bg-slate-50 border-r border-slate-200 rounded-none font-semibold"
                  >
                    <Plus className="h-4 w-4 text-[#1A365D]" />
                    New Calculation
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-bold">New Calculation (Ctrl+N)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDuplicateSelected}
                    disabled={!activeCardId}
                    className="h-8 gap-1.5 px-3 text-slate-700 hover:bg-slate-50 border-r border-slate-200 rounded-none font-semibold disabled:opacity-40"
                  >
                    <Copy className="h-4 w-4 text-slate-400" />
                    Duplicate
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-bold">Duplicate Active Sheet (Ctrl+D)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveDraft(false)}
                    disabled={summaryItems.length === 0}
                    className="h-8 gap-1.5 px-3 text-slate-700 hover:bg-slate-50 border-r border-slate-200 rounded-none font-semibold disabled:opacity-40"
                  >
                    <Save className="h-4 w-4 text-slate-400" />
                    {lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Save Draft"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-semibold">Save Draft Snapshot (Ctrl+S)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCalculateAll}
                    className="h-8 gap-1.5 px-3 text-slate-700 hover:bg-slate-50 border-r border-slate-200 rounded-none font-semibold"
                  >
                    <Calculator className="h-4 w-4 text-slate-400" />
                    Calculate
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-semibold">Calculate Costing Models (Ctrl+Enter)</TooltipContent>
              </Tooltip>
              
              {mode === "grade-builder" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useGradeBuilderStore.getState().toggleSidebar()}
                      className="h-8 gap-1.5 px-3 text-[#1A365D] hover:bg-slate-50 border-l border-slate-200 rounded-none font-semibold ml-2 bg-blue-50/50"
                    >
                      <Database className="h-4 w-4 text-[#1A365D]" />
                      Grade Library
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] font-semibold">Open Grade Library</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              disabled={summaryItems.length === 0}
              className="h-8 gap-1.5 px-3 text-emerald-700 hover:bg-emerald-50 border-r border-slate-200 rounded-none font-semibold disabled:opacity-40"
            >
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Submit
            </Button>

            {/* A6 fix: aria-expanded on export trigger */}
            <div className="relative flex items-center">
              <Button
                variant="ghost"
                size="sm"
                aria-haspopup="menu"
                aria-expanded={isExportOpen}
                onClick={() => setIsExportOpen(!isExportOpen)}
                disabled={summaryItems.length === 0}
                className="h-8 gap-1.5 px-3 text-slate-700 hover:bg-slate-50 rounded-none font-semibold disabled:opacity-40"
              >
                <Download className="h-4 w-4 text-slate-400" />
                Export
                <ChevronDown className="h-3 w-3 ml-0.5 text-slate-400" />
              </Button>
              {isExportOpen && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-sm shadow-md py-1 z-50">
                  <button
                    onClick={() => {
                      exportToPDF(summaryItems, grandTotal, summaryTotalQty);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      exportToExcel(summaryItems, grandTotal, summaryTotalQty);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV(summaryItems, grandTotal, summaryTotalQty);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-2"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-600" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Material, Grade, Recipe, ID..."
                aria-label="Search calculations"
                className="h-8 pl-9 pr-8 rounded-sm border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50 w-60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Badge variant="success" icon={<Lock className="h-3 w-3" />} className="rounded-sm bg-green-50 text-green-700 border border-green-200 font-bold text-[10px] h-8 px-2 flex items-center">
              Locked Prices
            </Badge>
          </div>
        </header>
      </div>

      {/* Row 2: KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 shrink-0">
        <KPICard
          label="Total Estimated Cost"
          value={<AnimatedNumber value={workspaceTotal} formatter={inr} />}
          subtext="All active sheets cost"
          trend={{ value: "+2.4%", type: "up" }}
          lastUpdated={lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Refreshed just now"}
          isLoading={isLoading}
          isHero={true}
          onClick={() => toast.info(`Grand Total cost of current workspace run is ${inr(workspaceTotal)}`)}
        />
        <KPICard
          label="Total Sheets"
          value={<AnimatedNumber value={cards.length} formatter={(v) => Math.round(v).toString()} />}
          subtext="Active workspace runs"
          trend={{ value: "+1 active", type: "up" }}
          lastUpdated="Updated just now"
          isLoading={isLoading}
          onClick={addCard}
        />
        <KPICard
          label="Total Quantity"
          value={<AnimatedNumber value={totalQuantity} formatter={(v) => `${Math.round(v).toLocaleString()} kg`} />}
          subtext="Total material volume"
          trend={{ value: "Optimal", type: "neutral" }}
          lastUpdated="Live flow"
          isLoading={isLoading}
          onClick={() => toast.info(`Total volume processed is ${totalQuantity.toLocaleString()} kg`)}
        />
        <KPICard
          label="Avg Cost/KG"
          value={<AnimatedNumber value={averageCostPerKg} formatter={inr} />}
          subtext="Weighted average"
          trend={{ value: "-0.5%", type: "down" }}
          lastUpdated="Live flow"
          isLoading={isLoading}
          onClick={() => toast.info(`Weighted average cost is ${inr(averageCostPerKg)} per kg`)}
        />
        <KPICard
          label="Last Saved"
          value={lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "Not Saved"}
          subtext="Active DB Draft"
          trend={{ value: lastSavedAt ? "Synced" : "Local", type: lastSavedAt ? "up" : "neutral" }}
          lastUpdated={lastSavedAt ? "Draft committed" : "Local session"}
          isLoading={isLoading}
          onClick={() => handleSaveDraft(false)}
        />
      </div>

      {/* Main Layout 8/4 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0 flex-1 relative">
        
        {/* Left: 8 cols (12 for Grade Builder) */}
        <div className={`flex flex-col gap-2 min-h-0 w-full ${mode === "grade-builder" ? "lg:col-span-12" : "lg:col-span-8"}`}>
          
          {/* Workflow Progress Stepper */}
          {mode === "grade-builder" ? (
            <GradeBuilderStepperWrapper />
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm px-4 py-1.5 shadow-sm shrink-0 flex items-center">
              <div className="flex items-center w-full justify-between max-w-3xl mx-auto">
                {[
                  { step: 1, label: "Select Grade" },
                  { step: 2, label: "Configure" },
                  { step: 3, label: "Calculate" },
                  { step: 4, label: "Review" },
                  { step: 5, label: "Submit" }
                ].map((item, index, arr) => (
                  <div key={item.step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-1.5">
                      <div
                        aria-current={currentStep === item.step ? "step" : undefined}
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-200 shrink-0 ${
                          currentStep === item.step
                            ? "bg-[#1A365D] text-white ring-2 ring-offset-1 ring-blue-200"
                            : currentStep > item.step
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {currentStep > item.step ? "✓" : item.step}
                      </div>
                      <span className={`text-[11px] font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 hidden sm:inline ${
                        currentStep === item.step
                          ? "text-[#1A365D]"
                          : currentStep > item.step
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}>
                        {item.label}
                      </span>
                    </div>

                    {index < arr.length - 1 && (
                      <div className={`h-px flex-1 mx-3 transition-colors duration-200 ${
                        currentStep > item.step ? "bg-emerald-400" : "bg-slate-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs value={mode} onValueChange={setWorkspace} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="bg-transparent border-x-0 border-t-0 border-b border-slate-200 rounded-none p-0 shrink-0 self-start w-full flex h-auto gap-0 justify-start mb-2 shadow-none">
              <TabsTrigger 
                value="metal" 
                className="group relative rounded-none px-3 pb-1.5 pt-1.5 text-[11px] font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 transition-all duration-200 ease-in-out gap-2 flex items-center select-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-[#1A365D] data-[state=active]:border-[#1A365D] data-[state=active]:font-extrabold data-[state=active]:shadow-none"
              >
                <Calculator className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                  mode === "metal" ? "text-[#1A365D] scale-105" : "text-slate-400 group-hover:text-slate-600"
                }`} />
                <span>Metal Calculator</span>
                <span className={`ml-1.5 min-w-[18px] text-center px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors duration-200 ${
                  mode === "metal"
                    ? "bg-blue-100 text-[#1A365D]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {metalCardsCount}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="raw-material" 
                className="group relative rounded-none px-3 pb-1.5 pt-1.5 text-[11px] font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 transition-all duration-200 ease-in-out gap-2 flex items-center select-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-[#1A365D] data-[state=active]:border-[#1A365D] data-[state=active]:font-extrabold data-[state=active]:shadow-none"
              >
                <Database className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                  mode === "raw-material" ? "text-[#1A365D] scale-105" : "text-slate-400 group-hover:text-slate-600"
                }`} />
                <span>Raw Material Builder</span>
                <span className={`ml-1.5 min-w-[18px] text-center px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors duration-200 ${
                  mode === "raw-material"
                    ? "bg-blue-100 text-[#1A365D]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {rawMaterialCardsCount}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="grade-builder" 
                className="group relative rounded-none px-3 pb-1.5 pt-1.5 text-[11px] font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 transition-all duration-200 ease-in-out gap-2 flex items-center select-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-[#1A365D] data-[state=active]:border-[#1A365D] data-[state=active]:font-extrabold data-[state=active]:shadow-none"
              >
                <Layers className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                  mode === "grade-builder" ? "text-[#1A365D] scale-105" : "text-slate-400 group-hover:text-slate-600"
                }`} />
                <span>Grade Builder</span>
                <span className={`ml-1.5 min-w-[18px] text-center px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors duration-200 ${
                  mode === "grade-builder"
                    ? "bg-blue-100 text-[#1A365D]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {gradesList.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent 
              value={mode} 
              className={`outline-none mt-2 flex-1 min-h-0 flex flex-col pr-2 scrollbar-thin ${
                mode === "grade-builder" ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              {mode === "grade-builder" ? (
                <GradeBuilderWorkspace />
              ) : (
                <>
                  <div className="flex items-center justify-between shrink-0 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      {mode === "metal" ? "Metal Calculations" : "Raw Materials Input"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-sm border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                      onClick={addCard}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Sheet
                    </Button>
                  </div>

                  {cards.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-white border-2 border-dashed border-slate-200 rounded-sm">
                      <div className="relative mb-6">
                        {/* Custom Enterprise Illustration */}
                        <div className="absolute -inset-4 bg-blue-50/50 rounded-full blur-xl" />
                        <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                           <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                             {/* Background Grid */}
                             <rect x="10" y="10" width="60" height="60" rx="8" fill="#F8FAFC" />
                             <path d="M10 25H70M10 40H70M10 55H70M25 10V70M40 10V70M55 10V70" stroke="#E2E8F0" strokeWidth="1" />
                             {/* Main Blueprint Sheet */}
                             <rect x="20" y="15" width="40" height="50" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="2" />
                             <rect x="26" y="23" width="16" height="4" rx="2" fill="#1A365D" />
                             <rect x="26" y="32" width="28" height="2" rx="1" fill="#E2E8F0" />
                             <rect x="26" y="38" width="28" height="2" rx="1" fill="#E2E8F0" />
                             <rect x="26" y="44" width="20" height="2" rx="1" fill="#E2E8F0" />
                             {/* Floating Chart Card */}
                             <g filter="url(#drop-shadow)">
                               <rect x="42" y="36" width="30" height="24" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1" />
                               <path d="M46 54L52 46L58 48L66 40" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                               <circle cx="66" cy="40" r="2" fill="#059669" />
                             </g>
                             {/* Floating Calculator Icon */}
                             <g filter="url(#drop-shadow-calc)">
                               <rect x="8" y="42" width="24" height="28" rx="6" fill="#1A365D" />
                               <rect x="12" y="46" width="16" height="6" rx="2" fill="#EFF6FF" />
                               <circle cx="14" cy="56" r="1.5" fill="#60A5FA" />
                               <circle cx="20" cy="56" r="1.5" fill="#60A5FA" />
                               <circle cx="26" cy="56" r="1.5" fill="#60A5FA" />
                               <circle cx="14" cy="62" r="1.5" fill="#60A5FA" />
                               <circle cx="20" cy="62" r="1.5" fill="#60A5FA" />
                               <circle cx="26" cy="62" r="1.5" fill="#F87171" />
                             </g>
                             <defs>
                               <filter id="drop-shadow" x="38" y="34" width="38" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                 <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.05" />
                               </filter>
                               <filter id="drop-shadow-calc" x="4" y="40" width="32" height="36" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                 <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
                               </filter>
                             </defs>
                           </svg>
                        </div>
                      </div>
                      
                      {/* E3 fix: enterprise-appropriate heading */}
                      <h3 className="text-slate-800 text-base font-bold tracking-tight mb-2">
                        No Calculations Configured
                      </h3>
                      <p className="text-xs text-slate-500 mb-6 font-medium max-w-sm text-center leading-relaxed">
                        Create a new calculation sheet to model material requirements, compare grades, and estimate manufacturing costs.
                      </p>
                      
                      <Button 
                        onClick={addCard} 
                        className="bg-[#1A365D] text-white font-bold h-10 px-6 rounded-sm hover:bg-[#122543] shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus className="h-4 w-4" />
                        Create Calculation
                      </Button>
                      
                      <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold text-slate-400">
                         <div className="flex items-center gap-1.5">
                           <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                             <span className="text-[10px]">Ctrl</span>
                           </div>
                           <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                             <span className="text-[10px]">N</span>
                           </div>
                           <span className="ml-1">New Sheet</span>
                         </div>
                      </div>
                    </div>
                  ) : filteredCards.length === 0 ? (
                     <Card className="border border-slate-200 bg-white rounded-sm shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-8 w-8 mb-2.5 text-slate-350" />
                        <strong className="text-slate-700 text-xs font-bold mb-1">
                          No Matching Calculation Sheets
                        </strong>
                        <p className="text-[11px] text-slate-400 font-semibold max-w-xs leading-normal">
                          We couldn't find any sheet matching your search for <span className="font-extrabold text-[#1A365D]">"{debouncedQuery}"</span>. Try typing different keywords.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {filteredCards.map((card, idx) => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedCardId(card.id);
                            }
                          }}
                          tabIndex={0}
                          role="tab"
                          aria-selected={activeCardId === card.id}
                          aria-label={`Calculation card ${idx + 1}: ${card.gradeName || "Custom"}`}
                          className={`cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#1A365D] focus-visible:outline-none ${activeCardId === card.id ? "ring-2 ring-blue-500/30 rounded-sm" : ""}`}
                        >
                          <CalculationCard
                            index={idx}
                            card={card}
                            metalsList={metalsList}
                            gradesList={gradesList}
                            rawMaterialsList={rawMaterialsList}
                            onUpdateData={updateCardState}
                            onRemove={() => removeCardState(card.id)}
                            searchQuery={debouncedQuery}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: 4 cols */}
        {mode !== "grade-builder" && (
          <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0 overflow-hidden pr-2 w-full">
          
          <Card className="border border-slate-200 bg-white shadow-sm rounded-sm shrink-0">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <h3 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">
                  Properties
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Unit</label>
                  <div className="h-7 rounded-sm border border-slate-200 bg-slate-50 px-2 flex items-center text-xs font-semibold text-slate-600">
                    Kilograms (kg)
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Currency</label>
                  <div className="h-7 rounded-sm border border-slate-200 bg-slate-50 px-2 flex items-center text-xs font-semibold text-slate-600">
                    INR (₹)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm rounded-sm shrink-0">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <h3 className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider">
                  Metadata
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Operator</span>
                  <strong className="text-xs font-bold text-slate-700 mt-0.5 truncate">{actor?.name || "System"}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={isSaving ? "Calculating" : (workflowStatus === "Ready" ? "Saved" : (workflowStatus === "Approved" ? "Success" : (workflowStatus === "Submitted" ? "Submitted" : "Draft")))} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">{new Date().toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Precision</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">4 Decimals</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm rounded-sm shrink-0">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calculator className="h-3.5 w-3.5 text-slate-400" />
                <h3 className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider">
                  Comparison Insights
                </h3>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-sm border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">Variance Analysis</p>
                <p className="font-medium text-slate-500 leading-relaxed text-[11px]">Run a full comparison to analyze cost variance against historical averages.</p>
                <Button variant="ghost" className="px-0 text-[#1A365D] h-auto text-xs font-semibold mt-2 hover:bg-transparent underline-offset-2 hover:underline">
                  View full comparison →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Summary / Live Cost Sheet Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 mt-2 shrink-0">
              <div className="w-0.5 h-4 bg-[#1A365D] rounded-full" />
              <h3 className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                Active Summary
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <LiveSummaryPanel
                items={summaryItems}
                onRemove={removeSummaryItem}
                onUpdateQty={(id, qty) => {
                  const item = summaryItems.find(i => i.id === id);
                  if (item) {
                    const newBase = qty * Number(item.unitPrice) * Number(item.gradeMultiplier) + (qty * Number(item.extraPrice));
                    setSummaryItems(summaryItems.map(i => i.id === id ? { ...i, quantity: qty, baseCost: newBase } : i));
                  }
                }}
                onClearAll={clearSummary}
                onSaveDraft={() => handleSaveDraft(false)}
                onComplete={handleComplete}
                isSaving={isSaving}
              />
            </div>
            </div>
          </div>
        )}

      </div>

      {/* Redesigned Bottom Summary Bar (Always Visible) */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-3 flex flex-col md:flex-row items-center justify-between shadow-sm rounded-sm gap-4 shrink-0 z-30">
        {/* Left Side: Status & Selections */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => setIsMobileSummaryOpen(true)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50/80 px-3 py-1.5 rounded-sm border border-slate-200/60 bg-slate-50/30 transition-colors shadow-2xs"
          >
            <Layers className="h-4 w-4 text-[#1A365D]" />
            <span className="text-xs font-bold text-slate-700">Selected Items:</span>
            <Badge variant="info" className="bg-blue-50 text-[#1A365D] border border-blue-100/80 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
              {summaryItems.length} {summaryItems.length === 1 ? 'Sheet' : 'Sheets'}
            </Badge>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <StatusBadge status={isSaving ? "Calculating" : (workflowStatus === "Ready" ? "Saved" : (workflowStatus === "Approved" ? "Success" : (workflowStatus === "Submitted" ? "Submitted" : "Draft")))} />
          </div>
        </div>

        {/* Right Side: Totals & Action */}
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex items-center gap-6 justify-between w-full md:w-auto">
            {/* Total Weight block */}
            <div className="flex flex-col items-start md:items-end text-left md:text-right">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Total Weight</span>
              <span className="text-xs font-bold text-slate-700 mt-1.5 font-mono">
                <AnimatedNumber value={summaryTotalQty} formatter={(v) => `${Math.round(v).toLocaleString()} kg`} />
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            {/* Estimated Cost block */}
            <div className="flex flex-col items-start md:items-end text-left md:text-right">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Estimated Cost</span>
              <span className="text-base font-black text-[#1A365D] mt-1.5 tracking-tight">
                <AnimatedNumber value={grandTotal} formatter={inr} />
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleComplete}
            disabled={summaryItems.length === 0}
            className="w-full md:w-auto h-9 px-6 font-bold uppercase text-xs tracking-wider bg-[#1A365D] hover:bg-[#122543] text-white rounded-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer shrink-0"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Submit
          </Button>
        </div>
      </footer>

      {/* MOBILE COLLAPSIBLE BOTTOM SHEET DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs xl:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="w-full max-h-[85vh] bg-white rounded-t-3xl border-t border-slate-200 overflow-hidden flex flex-col shadow-sm"
            >
              {/* Drawer Handle / Close — E1 fix: enterprise-appropriate title */}
              <div className="flex h-12 items-center justify-between border-b border-slate-100 bg-slate-50 px-5 text-slate-800">
                <span className="font-semibold text-sm text-slate-700">
                  Cost Summary
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-slate-400 hover:bg-slate-200 p-1"
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
                    updateCardState(id, { quantity: qty });
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
