import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  X,
  Loader2, 
  AlertCircle,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Shared design system components
import { 
  Card, 
  CardContent, 
  Input, 
  Select, 
  Badge, 
  Button, 
  inr,
  AlertBanner
} from "@jsw-mcms/ui";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { RawMaterialTable } from "./RawMaterialTable";
import type { RawMaterialItem } from "./RawMaterialTable";
import type { Grade, Metal, RawMaterial } from "@/types";
import { api } from "@/services/api";
import { usePreviewCalculationMutation, type CalculationItemPayload } from "@/services/api/calculation.api";
import { useDebounce } from "@/hooks/useDebounce";
import { AnimatedNumber } from "./AnimatedNumber";

// JSW MSME Steel categories and types catalog
export interface JSWSteelType {
  name: string;
  grades: string[];
  subGrades: string[];
  image: string;
  basePrice: number;
}

export interface JSWCategory {
  name: string;
  steelTypes: JSWSteelType[];
}

export function convertCatalogToHierarchy(flatCatalog: any[]): JSWCategory[] {
  const categoryMap = new Map<string, Map<string, JSWSteelType>>();

  flatCatalog.forEach(item => {
    const { category, steelType, grade, subGrade, image, basePrice } = item;
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map<string, JSWSteelType>());
    }
    
    const steelTypeMap = categoryMap.get(category)!;
    
    if (!steelTypeMap.has(steelType)) {
      steelTypeMap.set(steelType, {
        name: steelType,
        grades: [],
        subGrades: [],
        image: image || "coil",
        basePrice: Number(basePrice)
      });
    }
    
    const sType = steelTypeMap.get(steelType)!;
    if (grade && !sType.grades.includes(grade)) {
      sType.grades.push(grade);
    }
    if (subGrade && !sType.subGrades.includes(subGrade)) {
      sType.subGrades.push(subGrade);
    }
  });

  const hierarchy: JSWCategory[] = [];
  categoryMap.forEach((steelTypeMap, categoryName) => {
    const steelTypes: JSWSteelType[] = Array.from(steelTypeMap.values()).map(sType => {
      if (sType.grades.length === 0) sType.grades.push("Standard");
      if (sType.subGrades.length === 0) sType.subGrades.push("Standard");
      return sType;
    });
    hierarchy.push({
      name: categoryName,
      steelTypes
    });
  });

  return hierarchy;
}

export const defaultJswCategories: JSWCategory[] = [
  {
    name: "MS Hot Rolled",
    steelTypes: [
      { name: "HR Coil E250A", grades: ["E250A", "E275"], subGrades: ["Standard", "L"], image: "coil", basePrice: 63.75 },
      { name: "HR Sheet", grades: ["E350", "E410"], subGrades: ["Standard"], image: "sheet", basePrice: 65.20 },
      { name: "HR Plate", grades: ["E250", "E350"], subGrades: ["Standard"], image: "plate", basePrice: 67.50 }
    ]
  },
  {
    name: "MS Cold Rolled",
    steelTypes: [
      { name: "CR Coil", grades: ["D", "DD", "EDD"], subGrades: ["Standard"], image: "coil", basePrice: 68.40 },
      { name: "CR Sheet", grades: ["D", "DD"], subGrades: ["Standard"], image: "sheet", basePrice: 70.10 }
    ]
  },
  {
    name: "TMT",
    steelTypes: [
      { name: "TMT Fe500D", grades: ["Fe500D"], subGrades: ["Standard"], image: "bar", basePrice: 58.90 },
      { name: "TMT Fe550D", grades: ["Fe550D"], subGrades: ["Standard"], image: "bar", basePrice: 60.30 },
      { name: "TMT Fe600", grades: ["Fe600"], subGrades: ["Standard"], image: "bar", basePrice: 62.10 }
    ]
  },
  {
    name: "Coated Steel",
    steelTypes: [
      { name: "Galvanized Coil", grades: ["GP", "GC"], subGrades: ["Standard"], image: "coil", basePrice: 72.80 },
      { name: "Galvalume Sheet", grades: ["GL"], subGrades: ["Standard"], image: "sheet", basePrice: 74.50 }
    ]
  },
  {
    name: "Wire Rods",
    steelTypes: [
      { name: "MS Wire Rod", grades: ["SAE1006", "SAE1008"], subGrades: ["Standard"], image: "rod", basePrice: 61.20 },
      { name: "Carbon Steel Wire Rod", grades: ["EN8D", "EN9"], subGrades: ["Standard"], image: "rod", basePrice: 64.60 }
    ]
  },
  {
    name: "Structural Steel",
    steelTypes: [
      { name: "MS Angle", grades: ["E250"], subGrades: ["Standard"], image: "angle", basePrice: 66.80 },
      { name: "MS Channel", grades: ["E250"], subGrades: ["Standard"], image: "channel", basePrice: 67.90 },
      { name: "H-Beam", grades: ["E250", "E350"], subGrades: ["Standard"], image: "beam", basePrice: 71.40 }
    ]
  }
];

export const jswCategories: JSWCategory[] = defaultJswCategories;

export interface CalculationCardState {
  id: string;
  type: "metal" | "raw_material" | "grade_builder";
  metalId: string;
  gradeId: string;
  rawMaterialId: string;
  quantity: number;
  rawMaterials: RawMaterialItem[];
  isExpanded: boolean;
  addedToSummary?: boolean;
  categoryName?: string;
  steelTypeName?: string;
  gradeName?: string;
  subGradeName?: string;
}

interface CalculationCardProps {
  index: number;
  card: CalculationCardState;
  metalsList: Metal[];
  gradesList: Grade[];
  rawMaterialsList: RawMaterial[];
  onUpdateData: (id: string, data: Partial<CalculationCardState>) => void;
  onRemove: () => void;
  searchQuery?: string;
}



interface CalculationErrorDetail {
  reason: string;
  field: string;
  fix: string;
}

export function parseCalculationError(error: any): CalculationErrorDetail {
  const data = error?.response?.data;
  if (data?.message && data?.field && data?.fix) {
    return {
      reason: data.message,
      field: data.field,
      fix: data.fix
    };
  }
  const message = data?.message || error?.message || "An unexpected error occurred during costing calculation.";
  const msgLower = message.toLowerCase();
  
  let field = "General Workspace";
  let fix = "Please refresh the page or try adjusting the costing inputs.";
  
  if (msgLower.includes("quantity") || msgLower.includes("qty")) {
    field = "Quantity (kg)";
    fix = "Please enter a positive numeric quantity (e.g., > 0).";
  } else if (msgLower.includes("grade")) {
    field = "Steel Grade Selection";
    fix = "Select a valid steel grade for the chosen metal type.";
  } else if (msgLower.includes("material") || msgLower.includes("composition") || msgLower.includes("alloy")) {
    field = "Raw Materials / Recipe Composition";
    fix = "Ensure your raw material percentages sum exactly to 100%.";
  } else if (msgLower.includes("price") || msgLower.includes("rate")) {
    field = "Master Price Book";
    fix = "Check database settings or contact administrator for rate validation.";
  }
  
  return { reason: message, field, fix };
}

export function highlightText(text: string, query: string) {
  if (!query || !query.trim() || !text) return <span>{text}</span>;
  
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-250 text-slate-900 px-0.5 rounded-sm font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function CalculationCard({
  index,
  card,
  metalsList,
  gradesList,
  rawMaterialsList,
  onUpdateData,
  onRemove,
  searchQuery = "",
}: CalculationCardProps) {
  // Load dynamic JSW Product Catalog from ERP database
  const [categoriesList, setCategoriesList] = useState<JSWCategory[]>(defaultJswCategories);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Zustand Store Integration for reactive summary syncing
  const { summaryItems, addSummaryItem, removeSummaryItem } = useWorkspaceStore();

  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      try {
        const { data } = await api.get("/import/catalog");
        if (!active) return;
        if (data && data.data && data.data.length > 0) {
          const hierarchy = convertCatalogToHierarchy(data.data);
          if (hierarchy && hierarchy.length > 0) {
            setCategoriesList(hierarchy);
          }
        }
      } catch (err) {
        if (active && import.meta.env.MODE !== "test") {
          console.error("Failed to fetch JSW dynamic ERP catalog", err);
        }
      }
    };
    fetchCatalog();
    return () => {
      active = false;
    };
  }, []);

  // Retrieve selected JSW elements from card state values
  const activeCategoryName = card.categoryName || "MS Hot Rolled";
  const activeSteelTypeName = card.steelTypeName || "HR Coil E250A";
  const activeGradeName = card.gradeName || "E250A";
  const activeSubGradeName = card.subGradeName || "Standard";

  const selectedCategory = categoriesList.find(c => c.name === activeCategoryName) || categoriesList[0];
  const selectedSteelType = selectedCategory?.steelTypes.find(s => s.name === activeSteelTypeName) || selectedCategory?.steelTypes?.[0];

  const activeGrade = gradesList.find(g => g.id === card.gradeId || g.name.toLowerCase() === activeGradeName.toLowerCase()) || gradesList[0];
  const activeMetal = metalsList.find(m => m.id === card.metalId || m.id === activeGrade?.metalId) || metalsList[0];


  const gradeMultiplier = activeGrade ? Number(activeGrade.multiplier) : 1;
  const gradeExtraPrice = activeGrade ? Number(activeGrade.extraPrice) : 0;

  const usesRawMaterials = card.rawMaterials.length > 0;

  // Local state for backend results
  const [computedTotalCost, setComputedTotalCost] = useState<number>(0);
  const [computedUnitPrice, setComputedUnitPrice] = useState<number>(0);
  const [rawMaterialsTotalCost, setRawMaterialsTotalCost] = useState<number>(0);

  // Debounced input states to prevent backend spam
  const debouncedQuantity = useDebounce(card.quantity, 500);
  const debouncedRawMaterials = useDebounce(card.rawMaterials, 500);
  const debouncedMetalId = useDebounce(activeMetal?.id, 500);
  const debouncedGradeId = useDebounce(activeGrade?.id, 500);

  const previewMutation = usePreviewCalculationMutation();

  useEffect(() => {
    // Flatten the payload into the format expected by POST /calculations/preview
    const items: CalculationItemPayload[] = [];
    
    if (card.type === "raw_material" || usesRawMaterials) {
      debouncedRawMaterials.forEach(rm => {
        const itemQty = card.type === "raw_material" ? rm.quantity : (debouncedQuantity * ((rm.compositionPct ?? 0) / 100));
        if (itemQty > 0) {
          items.push({
            rawMaterialId: rm.rawMaterialId,
            quantity: itemQty,
            compositionPct: rm.compositionPct
          });
        }
      });
    } else {
      if (debouncedQuantity > 0) {
        items.push({
          metalId: debouncedMetalId || card.metalId,
          gradeId: debouncedGradeId || card.gradeId,
          quantity: debouncedQuantity,
        });
      }
    }

    if (items.length > 0) {
      previewMutation.mutate({
        name: "Preview",
        mode: card.type === "raw_material" ? "raw-material" : "metal",
        items
      }, {
        onSuccess: (data) => {
          const finalCostNum = Number(data.finalCost);
          setComputedTotalCost(finalCostNum);
          setComputedUnitPrice(debouncedQuantity > 0 ? finalCostNum / debouncedQuantity : 0);
          if (card.type === "raw_material" || usesRawMaterials) {
            setRawMaterialsTotalCost(finalCostNum);
          }
        }
      });
    } else {
      setComputedTotalCost(0);
      setComputedUnitPrice(0);
      setRawMaterialsTotalCost(0);
    }
  }, [
    debouncedQuantity, 
    debouncedRawMaterials, 
    debouncedMetalId, 
    debouncedGradeId, 
    card.type, 
    usesRawMaterials, 
    card.metalId, 
    card.gradeId
  ]);

  const mappedRawMaterials = card.rawMaterials.map((item) => {
    if (item.compositionPct !== undefined) return item;
    const pct = card.type !== "raw_material" && card.quantity > 0 ? (item.quantity / card.quantity) * 100 : 0;
    return { ...item, compositionPct: pct };
  });

  const isAdded = useMemo(() => {
    return summaryItems.some((item) => item.id === card.id);
  }, [summaryItems, card.id]);

  // Automatically sync changes to summary ledger reactively
  useEffect(() => {
    if (isAdded) {
      const summaryItem = {
        id: card.id,
        name: card.type === "raw_material" ? (card.gradeName || "Custom Material List") : `${activeSteelTypeName} (${activeGradeName})`,
        quantity: card.quantity,
        unitPrice: computedUnitPrice,
        gradeMultiplier: gradeMultiplier,
        extraPrice: gradeExtraPrice,
        baseCost: computedTotalCost,
        metalId: activeMetal?.id || card.metalId || "metal-ss",
        gradeId: activeGrade?.id || card.gradeId || "grade-304",
        categoryName: activeCategoryName,
        steelTypeName: activeSteelTypeName,
        gradeName: activeGradeName,
        subGradeName: activeSubGradeName,
        rawMaterials: card.rawMaterials,
        isAlloyed: usesRawMaterials
      };
      addSummaryItem(summaryItem);
    }
  }, [
    isAdded,
    card.id,
    card.quantity,
    card.metalId,
    card.gradeId,
    activeCategoryName,
    activeSteelTypeName,
    activeGradeName,
    activeSubGradeName,
    card.rawMaterials,
    computedUnitPrice,
    computedTotalCost,
    usesRawMaterials,
    addSummaryItem,
    gradeMultiplier,
    gradeExtraPrice,
    activeMetal,
    activeGrade
  ]);

  // Event handlers
  const handleCategoryChange = (categoryName: string) => {
    const nextCat = categoriesList.find(c => c.name === categoryName) || categoriesList[0];
    const nextSteel = nextCat.steelTypes[0];
    const gName = nextSteel.grades[0];
    const nextGrade = gradesList.find(g => g.name.toLowerCase() === gName.toLowerCase());
    
    onUpdateData(card.id, {
      categoryName,
      steelTypeName: nextSteel.name,
      gradeName: gName,
      subGradeName: nextSteel.subGrades[0] || "Standard",
      gradeId: nextGrade?.id,
      metalId: nextGrade?.metalId
    });
  };

  const handleSteelTypeChange = (steelTypeName: string) => {
    const nextSteel = selectedCategory.steelTypes.find(s => s.name === steelTypeName) || selectedCategory.steelTypes[0];
    const gName = nextSteel.grades[0];
    const nextGrade = gradesList.find(g => g.name.toLowerCase() === gName.toLowerCase());
    
    onUpdateData(card.id, {
      steelTypeName,
      gradeName: gName,
      subGradeName: nextSteel.subGrades[0] || "Standard",
      gradeId: nextGrade?.id,
      metalId: nextGrade?.metalId
    });
  };

  const handleGradeChange = (gradeName: string) => {
    const nextGrade = gradesList.find(g => g.name.toLowerCase() === gradeName.toLowerCase());
    onUpdateData(card.id, { 
      gradeName,
      gradeId: nextGrade?.id,
      metalId: nextGrade?.metalId
    });
  };

  const handleSubGradeChange = (subGradeName: string) => {
    onUpdateData(card.id, { subGradeName });
  };

  const handleQuantityChange = (quantity: number) => {
    if (quantity < 0) {
      toast.error("Quantity cannot be negative.");
      return;
    }
    const nextQty = quantity;
    
    // Scale raw materials reactively if it is an alloy card
    const scaledRawMaterials = card.rawMaterials.map((item) => {
      const pct = item.compositionPct !== undefined ? item.compositionPct : (card.quantity > 0 ? (item.quantity / card.quantity) * 100 : 0);
      const computedQty = (pct / 100) * nextQty;
      return { 
        ...item, 
        quantity: computedQty, 
        compositionPct: pct 
      };
    });

    onUpdateData(card.id, {
      quantity: nextQty,
      rawMaterials: scaledRawMaterials
    });
  };

  const handleUpdateRawMaterials = (rawMaterials: RawMaterialItem[]) => {
    onUpdateData(card.id, {
      rawMaterials
    });
  };

  const handleConfirmRemove = () => {
    if (window.confirm("Are you sure you want to delete this calculation card? This will also remove it from the summary ledger.")) {
      removeSummaryItem(card.id);
      onRemove();
      toast.success("Calculation card deleted successfully.");
    }
  };

  const handleAddToSummary = () => {
    // 1. Validation Before Action
    if (card.type !== "raw_material" && card.quantity <= 0) {
      toast.error("Cannot add to summary without quantity. Please input a quantity > 0.");
      return;
    }
    if (card.type !== "raw_material" && (!activeCategoryName || !activeSteelTypeName || !activeGradeName)) {
      toast.error("Cannot add to summary. Product parameters are incomplete.");
      return;
    }

    // 2. Create Calculation Item
    const name = card.type === "raw_material" 
      ? (card.gradeName || "Custom Material List") 
      : `${activeSteelTypeName} (${activeGradeName})`;
    
    const baseCost = card.type === "raw_material" ? rawMaterialsTotalCost : computedTotalCost;

    const summaryItem = {
      id: card.id,
      name,
      quantity: card.type === "raw_material" ? card.rawMaterials.reduce((sum, rm) => sum + rm.quantity, 0) : card.quantity,
      unitPrice: computedUnitPrice,
      gradeMultiplier: 1.0,
      extraPrice: 0,
      baseCost: baseCost,
      metalId: activeMetal?.id || card.metalId || "metal-ss",
      gradeId: activeGrade?.id || card.gradeId || "grade-304",
      categoryName: activeCategoryName,
      steelTypeName: activeSteelTypeName,
      gradeName: activeGradeName,
      subGradeName: activeSubGradeName,
      rawMaterials: card.rawMaterials,
      isAlloyed: usesRawMaterials
    };

    // 3. Push and Update summary
    addSummaryItem(summaryItem);
    onUpdateData(card.id, { addedToSummary: true });
    toast.success(`✓ Added ${name} to Industrial summary ledger!`);
  };

  const handleRemoveFromSummary = () => {
    removeSummaryItem(card.id);
    onUpdateData(card.id, { addedToSummary: false });
    toast.info(`Removed ${activeSteelTypeName} from Industrial summary ledger.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative text-left animate-fade-in mb-5"
    >
      <Card className={`overflow-visible border bg-white rounded-sm font-inter transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.005] ${
        isAdded 
          ? "border-[#1A365D]/40 shadow-md ring-1 ring-[#1A365D]/20" 
          : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}>
        
        {/* HEADER: Card Number, Grade Name, Status, Last Updated, More Menu */}
        <div className={`flex items-center justify-between border-b px-4 py-2.5 transition-colors ${
          isAdded ? "border-[#1A365D]/10 bg-blue-50/40" : "border-slate-100 bg-slate-50/70"
        }`}>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-white font-mono text-[10px] px-2 py-0.5 rounded-sm shadow-sm">
              #{index + 1}
            </Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-450 bg-white font-mono text-[9px] px-1.5 py-0.5 rounded-sm shadow-xs">
              ID: {highlightText(card.id.substring(0, 8), searchQuery)}
            </Badge>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
              {card.type === "raw_material" 
                ? highlightText(card.gradeName || "Custom Material List", searchQuery) 
                : highlightText(activeSteelTypeName, searchQuery)
              } ({highlightText(activeGradeName, searchQuery)})
            </h3>
            {isAdded ? (
              <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[9px] rounded-sm px-1.5 py-0 border flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Added
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[9px] rounded-sm px-1.5 py-0 border">
                Draft
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            {/* E5 fix: removed hardcoded 'Updated just now' — only show actual timestamp when available */}
            {card.type !== "raw_material" && card.quantity > 0 && (
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                {computedUnitPrice === 0 ? (
                  <Badge variant="danger" className="text-[8px] font-black tracking-wide px-1 rounded-sm">Price Missing</Badge>
                ) : (
                  `${inr(computedUnitPrice)}/kg`
                )}
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                aria-label="Card Options"
                aria-haspopup="true"
                aria-expanded={isMoreMenuOpen}
                className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1A365D] focus-visible:outline-none"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white rounded-sm shadow-lg border border-slate-200 z-50 overflow-hidden py-1"
                    >
                      <button
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          toast.info("Duplicate functionality pending");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          handleConfirmRemove();
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <CardContent className="p-0 flex flex-col">
          
          {/* BODY SECTION 1: Category, Steel Type, Grade, Sub Grade */}
          {card.type !== "raw_material" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-slate-100 bg-white">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                <Select
                  value={activeCategoryName}
                  options={categoriesList.map(c => ({ value: c.name, label: c.name }))}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="h-8 rounded-sm border-slate-200 text-xs font-medium focus:ring-[#1A365D] hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Steel Type</label>
                <Select
                  value={activeSteelTypeName}
                  options={selectedCategory?.steelTypes.map(s => ({ value: s.name, label: s.name })) || []}
                  onChange={(e) => handleSteelTypeChange(e.target.value)}
                  className="h-8 rounded-sm border-slate-200 text-xs font-medium focus:ring-[#1A365D] hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Grade</label>
                <Select
                  value={activeGradeName}
                  options={selectedSteelType?.grades.map(g => ({ value: g, label: g })) || []}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="h-8 rounded-sm border-slate-200 text-xs font-medium focus:ring-[#1A365D] hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sub Grade</label>
                <Select
                  value={activeSubGradeName}
                  options={selectedSteelType?.subGrades.map(sg => ({ value: sg, label: sg })) || []}
                  onChange={(e) => handleSubGradeChange(e.target.value)}
                  className="h-8 rounded-sm border-slate-200 text-xs font-medium focus:ring-[#1A365D] hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {previewMutation.isError && (
            <div className="px-4 py-3 bg-[#fdf0f0]/30 border-b border-[#f9cccc]/60 shrink-0">
              {(() => {
                const parsed = parseCalculationError(previewMutation.error);
                return (
                  <AlertBanner
                    variant="danger"
                    title="Cost Calculation Failed"
                    isDismissible={false}
                    description={`${parsed.reason} - ${parsed.field} (${parsed.fix})`}
                    action={
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => previewMutation.reset()}
                      >
                        Dismiss
                      </Button>
                    }
                  />
                );
              })()}
            </div>
          )}

          {/* BODY SECTION 2: Quantity & Quick Pricing */}
          {card.type !== "raw_material" && (
            <div className={`flex flex-col md:flex-row items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 relative transition-all duration-200 ${previewMutation.isPending ? "animate-pulse" : ""}`}>
              {previewMutation.isPending && (
                <div className="absolute inset-x-0 top-0 h-0.5 z-10 overflow-hidden bg-blue-50/30">
                  <div className="h-full bg-[#1A365D] animate-loading-bar" />
                </div>
              )}
              
              <div className="flex items-center gap-4 w-full md:w-auto mb-3 md:mb-0">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`qty-input-${card.id}`} className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quantity (kg)</label>
                  <Input
                    id={`qty-input-${card.id}`}
                    type="number"
                    value={card.quantity === 0 ? "" : card.quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    placeholder="0.00"
                    className="h-8 w-32 rounded-sm border-slate-200 text-sm font-bold font-mono bg-white focus:ring-[#1A365D] hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
                
                <div className="h-10 w-px bg-slate-200 hidden md:block mx-2"></div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Price/KG</span>
                  {computedUnitPrice === 0 ? (
                    <Badge variant="danger" className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mt-0.5">Price Missing</Badge>
                  ) : (
                    <span className="text-sm font-bold text-slate-800 font-mono">{inr(computedUnitPrice)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Cost/Ton</span>
                  {computedUnitPrice === 0 ? (
                    <Badge variant="danger" className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mt-0.5">Price Missing</Badge>
                  ) : (
                    <span className="text-sm font-medium text-slate-600 font-mono">{inr(computedUnitPrice * 1000)}/t</span>
                  )}
                </div>
                
                <div className="flex flex-col items-end p-2 bg-white rounded-sm border border-slate-200 shadow-xs min-w-[140px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Total Estimated Cost</span>
                  {computedTotalCost === 0 ? (
                    <Badge variant="danger" className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mt-0.5">Price Missing</Badge>
                  ) : (
                    <span className="text-lg font-black text-[#1A365D] font-mono leading-none">
                      <AnimatedNumber value={computedTotalCost} formatter={inr} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BODY SECTION 3: Recipe Ingredients Table */}
          {card.type === "raw_material" || usesRawMaterials ? (
            <div className="flex flex-col p-0 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100/80">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Recipe Ingredients
                </span>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Subtotal:</span>
                    {computedTotalCost === 0 ? (
                      <Badge variant="danger" className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm inline-block">Price Missing</Badge>
                    ) : (
                      <span className="text-xs font-mono font-black text-slate-750">{inr(computedTotalCost)}</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBuilderOpen(true)}
                    className="h-7 px-3.5 text-xs font-bold text-[#1A365D] border-[#1A365D]/30 bg-white hover:bg-[#1A365D]/5 rounded-sm cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Recipe
                  </Button>
                </div>
              </div>
              <div className="px-4 py-2 text-[11px] text-slate-650">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Material</th>
                      <th className="py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Composition %</th>
                      <th className="py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Qty (kg)</th>
                      <th className="py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-right">Rate/KG</th>
                      <th className="py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedRawMaterials.map((item, idx) => {
                      const raw = rawMaterialsList.find((rm) => rm.id === item.rawMaterialId);
                      const name = raw?.name || "Ingredient";
                      const pct = item.compositionPct !== undefined ? Number(item.compositionPct ?? 0).toFixed(1) : "0.0";
                      const rawPrice = Number((raw as any)?.currentRate ?? raw?.prices?.[0]?.pricePerUnit ?? 0);
                      const qty = card.type === "raw_material" ? item.quantity : (card.quantity > 0 ? (item.compositionPct! / 100) * card.quantity : item.quantity);
                      const amount = qty * rawPrice;
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors odd:bg-white even:bg-slate-50/20">
                          <td className="py-1.5 font-medium text-slate-800">{highlightText(name, searchQuery)}</td>
                          <td className="py-1.5 font-mono text-slate-600">{pct}%</td>
                          <td className="py-1.5 font-mono text-slate-600">{Number(qty ?? 0).toFixed(1)} kg</td>
                          <td className="py-1.5 font-mono text-slate-600 text-right font-bold">
                            {rawPrice === 0 ? (
                              <Badge variant="danger" className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm">No Rate</Badge>
                            ) : (
                              inr(rawPrice)
                            )}
                          </td>
                          <td className="py-1.5 font-mono font-bold text-slate-850 text-right">
                            {amount === 0 ? (
                              <Badge variant="danger" className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm">Price Missing</Badge>
                            ) : (
                              inr(amount)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {mappedRawMaterials.length > 0 && (
                      <tr className="border-t-2 border-slate-200 bg-slate-50/40 font-bold">
                        <td className="py-2 text-[10px] uppercase text-slate-500 font-bold">Total</td>
                        <td className="py-2 font-mono text-slate-700">
                          {(() => {
                            const totalPct = mappedRawMaterials.reduce((sum, item) => sum + (item.compositionPct ?? 0), 0);
                            return `${Number(totalPct.toFixed(1))}%`;
                          })()}
                        </td>
                        <td className="py-2 font-mono text-slate-700">
                          {(() => {
                            const totalQty = mappedRawMaterials.reduce((sum, item) => {
                              const qty = card.type === "raw_material" ? item.quantity : (card.quantity > 0 ? (item.compositionPct! / 100) * card.quantity : item.quantity);
                              return sum + qty;
                            }, 0);
                            return `${totalQty.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`;
                          })()}
                        </td>
                        <td className="py-2 text-right text-[10px] text-slate-400 font-medium">Avg price / kg:</td>
                        <td className="py-2 font-mono text-right text-[#1A365D] font-black">
                          {computedTotalCost === 0 ? (
                            <Badge variant="danger" className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm">Price Missing</Badge>
                          ) : (
                            inr(computedTotalCost)
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white">
               <span className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                 <Layers className="w-4 h-4 text-slate-300" />
                 No custom recipe configured. Using standard grade pricing.
               </span>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBuilderOpen(true)}
                  className="h-8 px-3.5 text-xs font-bold text-[#1A365D] border-[#1A365D]/30 bg-white hover:bg-[#1A365D]/5 rounded-sm cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Add Recipe
                </Button>
            </div>
          )}

          {/* FOOTER: Cost Summary Bar & CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/70">
            {/* I5 fix: cost breakdown placeholders labelled as pending estimates */}
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <div className="flex flex-col min-w-max">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Base Cost</span>
                {computedTotalCost === 0 ? (
                  <Badge variant="danger" className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mt-0.5 block w-max">Price Missing</Badge>
                ) : (
                  <span className="text-xs font-bold text-slate-700 font-mono mt-0.5">{inr(computedTotalCost)}</span>
                )}
              </div>
              <div className="text-slate-200 text-base font-normal">+</div>
              <div className="flex flex-col min-w-max">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Additives</span>
                <span className="text-xs font-medium text-slate-400 font-mono mt-0.5">Pending</span>
              </div>
              <div className="text-slate-200 text-base font-normal">+</div>
              <div className="flex flex-col min-w-max">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Adjustments</span>
                <span className="text-xs font-medium text-slate-400 font-mono mt-0.5">Pending</span>
              </div>
              <div className="text-slate-200 text-base font-normal">+</div>
              <div className="flex flex-col min-w-max">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Other Charges</span>
                <span className="text-xs font-medium text-slate-400 font-mono mt-0.5">Pending</span>
              </div>
            </div>

            {/* CTA */}
            <div className="w-full sm:w-auto flex justify-end">
              {isAdded ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFromSummary}
                  disabled={card.type !== "raw_material" && card.quantity <= 0}
                  className="h-8 px-4 rounded-sm hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold text-[10px] uppercase tracking-wider border-slate-200 hover:border-red-200 cursor-pointer shadow-sm transition-colors w-full sm:w-auto"
                >
                  Remove From Summary
                </Button>
              ) : (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-full sm:w-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAddToSummary}
                          disabled={card.type !== "raw_material" && card.quantity <= 0}
                          className="h-8 px-5 rounded-sm bg-[#1A365D] hover:bg-[#122543] text-white font-semibold text-[10px] uppercase tracking-wider shadow-sm cursor-pointer transition-colors w-full"
                        >
                          Add To Summary
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {card.type !== "raw_material" && card.quantity <= 0 && (
                      <TooltipContent side="top" className="text-[10px] font-medium">
                        Enter a quantity greater than 0 to add this sheet to the summary.
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Recipe Builder Modal Dialog */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="recipe-modal-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="recipe-modal-container relative z-10"
            >
              {/* Header */}
              <div className="recipe-modal-header">
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                    Recipe Manager & Builder
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Configure ingredients for {activeSteelTypeName} ({activeGradeName})
                  </p>
                </div>
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="h-7 w-7 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="recipe-modal-body flex flex-col gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-sm px-3 py-2 text-[11px] text-blue-800 font-medium text-left">
                  Configure the composition percentage of raw material ingredients. Target quantities calculate automatically based on parent card total volume ({card.quantity} kg).
                </div>

                {/* Recipe Summary KPI strip */}
                {(() => {
                  const totalPct = card.rawMaterials.reduce((sum, rm) => {
                    if (rm.compositionPct !== undefined) return sum + rm.compositionPct;
                    if (card.quantity > 0) return sum + (rm.quantity / card.quantity) * 100;
                    return sum;
                  }, 0);
                  const totalQty = card.rawMaterials.reduce((sum, rm) => {
                    const pct = rm.compositionPct !== undefined ? rm.compositionPct : (card.quantity > 0 ? (rm.quantity / card.quantity) * 100 : 0);
                    const qty = card.type === "raw_material" ? rm.quantity : (card.quantity > 0 ? (pct / 100) * card.quantity : rm.quantity);
                    return sum + qty;
                  }, 0);
                  const totalCost = card.rawMaterials.reduce((sum, rm) => {
                    const currentMaterial = rawMaterialsList.find((r) => r.id === rm.rawMaterialId) || rawMaterialsList[0];
                    const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);
                    const pct = rm.compositionPct !== undefined ? rm.compositionPct : (card.quantity > 0 ? (rm.quantity / card.quantity) * 100 : 0);
                    const qty = card.type === "raw_material" ? rm.quantity : (card.quantity > 0 ? (pct / 100) * card.quantity : rm.quantity);
                    return sum + (qty * pricePerKg);
                  }, 0);
                  
                  const isRecipeBalanced = Math.abs(totalPct - 100) < 0.1;

                  return (
                    <div className="kpi-strip">
                      <div className="kpi-strip-card flex flex-col text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Weight</span>
                        <span className="text-sm font-mono font-black text-slate-800 mt-0.5">
                          {totalQty.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg
                        </span>
                      </div>
                      <div className="kpi-strip-card flex flex-col text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estimated Cost</span>
                        <span className="text-sm font-mono font-black text-slate-800 mt-0.5">
                          {inr(totalCost)}
                        </span>
                      </div>
                      <div className="kpi-strip-card flex flex-col text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Balance Status</span>
                        <span className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${isRecipeBalanced ? "text-emerald-600" : "text-amber-600"}`}>
                          {isRecipeBalanced ? "✓ Balanced (100%)" : `⚠ Unbalanced (${totalPct.toFixed(1)}%)`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                <RawMaterialTable
                  rawMaterials={card.rawMaterials}
                  rawMaterialsList={rawMaterialsList}
                  cardQuantity={card.quantity}
                  onUpdate={handleUpdateRawMaterials}
                />
              </div>

              {/* Footer */}
              <div className="recipe-modal-footer">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Computed Recipe Cost</span>
                  <span className="text-base font-mono font-black text-slate-800 mt-0.5">{inr(computedTotalCost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsBuilderOpen(false);
                      toast.info("Recipe builder closed without saving.");
                    }}
                    className="h-8 px-4 rounded-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsBuilderOpen(false);
                      // W3 fix: confirm recipe applied
                      toast.success("✓ Recipe configuration applied successfully.");
                    }}
                    className="h-8 px-5 rounded-sm bg-[#1A365D] hover:bg-[#122543] text-white text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
                  >
                    Apply Recipe
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
