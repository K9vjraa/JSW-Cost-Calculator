import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  Lock, 
  Trash2, 
  CheckCircle,
  Sparkles,
  XCircle,
  X,
  Edit
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

// Shared design system components
import { 
  Card, 
  CardContent, 
  Input, 
  Select, 
  Badge, 
  Button, 
  inr 
} from "@jsw-mcms/ui";

import { useSummaryStore } from "@/store/summaryStore";
import { RawMaterialTable } from "./RawMaterialTable";
import type { RawMaterialItem } from "./RawMaterialTable";
import type { Grade, Metal, RawMaterial } from "@/types";
import { api } from "@/services/api";

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
  type: "metal" | "raw_material";
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
}

function ProductThumbnail({ category, steelType }: { category: string; steelType: string }) {
  const normalizedCat = category.toLowerCase();
  const normalizedSteel = steelType.toLowerCase();

  // Coil illustrations
  if (normalizedSteel.includes("coil") || normalizedCat.includes("coil")) {
    return (
      <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="#002652" />
        <ellipse cx="50" cy="50" rx="20" ry="14" fill="#ffffff" />
        <ellipse cx="50" cy="50" rx="10" ry="7" fill="#002652" />
      </svg>
    );
  }

  // Sheet illustrations
  if (normalizedSteel.includes("sheet") || normalizedCat.includes("sheet")) {
    return (
      <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
        <path d="M20 40 L70 20 L85 35 L35 55 Z" fill="#64748b" stroke="#ffffff" strokeWidth="0.5" />
        <path d="M20 50 L70 30 L85 45 L35 65 Z" fill="#475569" stroke="#ffffff" strokeWidth="0.5" />
        <path d="M20 60 L70 40 L85 55 L35 75 Z" fill="#334155" stroke="#ffffff" strokeWidth="0.5" />
      </svg>
    );
  }

  // Plate illustrations
  if (normalizedSteel.includes("plate") || normalizedCat.includes("plate")) {
    return (
      <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
        <path d="M15 45 L70 25 L85 45 L30 65 Z" fill="#52525b" />
        <path d="M15 45 L15 53 L30 73 L30 65 Z" fill="#27272a" />
        <path d="M30 65 L30 73 L85 53 L85 45 Z" fill="#18181b" />
      </svg>
    );
  }

  // Wire Rod illustrations
  if (normalizedSteel.includes("rod") || normalizedCat.includes("rod")) {
    return (
      <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
        <circle cx="50" cy="50" r="25" fill="none" stroke="#7c3aed" strokeWidth="3" />
        <circle cx="55" cy="45" r="25" fill="none" stroke="#7c3aed" strokeWidth="2.5" opacity="0.8" />
        <circle cx="45" cy="55" r="25" fill="none" stroke="#7c3aed" strokeWidth="2" opacity="0.6" />
      </svg>
    );
  }

  // Structural illustrations
  if (normalizedSteel.includes("angle") || normalizedSteel.includes("channel") || normalizedSteel.includes("beam") || normalizedCat.includes("structural")) {
    return (
      <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
        <path d="M25 25 L35 25 L35 45 L75 45 L75 25 L85 25 L85 75 L75 75 L75 55 L35 55 L35 75 L25 75 Z" fill="#0891b2" />
      </svg>
    );
  }

  // Default: Rebar/Bar (TMT)
  return (
    <svg viewBox="0 0 100 100" className="size-14 bg-slate-50 border border-border rounded-sm p-1 shrink-0">
      <rect x="15" y="42" width="70" height="8" rx="2" fill="#10b981" />
      <path d="M25 42 L30 50 M40 42 L45 50 M55 42 L60 50 M70 42 L75 50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      <rect x="15" y="58" width="70" height="8" rx="2" fill="#047857" />
      <path d="M20 58 L25 66 M35 58 L40 66 M50 58 L55 66 M65 58 L70 66" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
    </svg>
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
}: CalculationCardProps) {
  // Load dynamic JSW Product Catalog from ERP database
  const [categoriesList, setCategoriesList] = useState<JSWCategory[]>(defaultJswCategories);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  // Zustand Store Integration for reactive summary syncing
  const { summaryItems, addSummaryItem, removeSummaryItem } = useSummaryStore();

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

  const metalBasePrice = activeMetal?.prices?.[0]?.pricePerUnit ? Number(activeMetal.prices[0].pricePerUnit) : (selectedSteelType?.basePrice || 0);
  const gradeMultiplier = activeGrade ? Number(activeGrade.multiplier) : 1;
  const gradeExtraPrice = activeGrade ? Number(activeGrade.extraPrice) : 0;

  const standardUnitPrice = useMemo(() => {
    return metalBasePrice * gradeMultiplier + gradeExtraPrice;
  }, [metalBasePrice, gradeMultiplier, gradeExtraPrice]);

  const standardTotalCost = useMemo(() => {
    return card.quantity * standardUnitPrice;
  }, [card.quantity, standardUnitPrice]);

  // Raw material composition pricing data (if expanded/alloyed)
  const mappedRawMaterials = useMemo(() => {
    return card.rawMaterials.map((item) => {
      if (item.compositionPct !== undefined) return item;
      const pct = card.quantity > 0 ? (item.quantity / card.quantity) * 100 : 0;
      return { ...item, compositionPct: pct };
    });
  }, [card.rawMaterials, card.quantity]);

  const rawMaterialsTotalCost = useMemo(() => {
    return mappedRawMaterials.reduce((total, item) => {
      const raw = rawMaterialsList.find((rm) => rm.id === item.rawMaterialId);
      const rawPrice = Number(raw?.prices?.[0]?.pricePerUnit ?? 0);
      const qty = card.quantity > 0 ? (item.compositionPct! / 100) * card.quantity : item.quantity;
      return total + (qty * rawPrice);
    }, 0);
  }, [mappedRawMaterials, rawMaterialsList, card.quantity]);

  // Decide computed cost and unit price based on raw material configuration
  const usesRawMaterials = card.rawMaterials.length > 0;

  const computedTotalCost = useMemo(() => {
    return usesRawMaterials ? rawMaterialsTotalCost : standardTotalCost;
  }, [usesRawMaterials, rawMaterialsTotalCost, standardTotalCost]);

  const computedUnitPrice = useMemo(() => {
    if (usesRawMaterials) {
      return card.quantity > 0 ? (rawMaterialsTotalCost / card.quantity) : 0;
    }
    return standardUnitPrice;
  }, [usesRawMaterials, card.quantity, rawMaterialsTotalCost, standardUnitPrice]);

  const isAdded = useMemo(() => {
    return summaryItems.some((item) => item.id === card.id);
  }, [summaryItems, card.id]);

  // Automatically sync changes to summary ledger reactively
  useEffect(() => {
    if (isAdded) {
      const summaryItem = {
        id: card.id,
        name: `${activeSteelTypeName} (${activeGradeName})`,
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
    if (card.quantity <= 0) {
      toast.error("Cannot add to summary without quantity. Please input a quantity > 0.");
      return;
    }
    if (!activeCategoryName || !activeSteelTypeName || !activeGradeName) {
      toast.error("Cannot add to summary. Product parameters are incomplete.");
      return;
    }

    // 2. Create Calculation Item
    const summaryItem = {
      id: card.id,
      name: `${activeSteelTypeName} (${activeGradeName})`,
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

    // 3. Push and Update summary
    addSummaryItem(summaryItem);
    onUpdateData(card.id, { addedToSummary: true });
    toast.success(`✓ Added ${activeSteelTypeName} to Industrial summary ledger!`);
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
      className="group relative text-left animate-fade-in"
    >
      <Card className="overflow-hidden border-border bg-white transition-all duration-200 hover:border-secondary-foreground relative rounded-md">
        {/* Decorative JSW blue accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

        <CardContent className="p-4 flex flex-col gap-3">
          
          {/* CARD HEADER: Dynamic MSME Visual Thumbnail */}
          <div className="flex items-center justify-between border-b border-slate-100 h-[60px] pb-2">
            <div className="flex items-center gap-3">
              <ProductThumbnail category={activeCategoryName} steelType={activeSteelTypeName} />
              
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/70 font-black text-[9px] px-1.5 py-0.5 rounded-sm leading-none shrink-0">
                    Card {index + 1}
                  </Badge>
                  <h3 className="font-extrabold text-slate-800 tracking-tight text-xs uppercase truncate max-w-44" title={activeSteelTypeName}>
                    {activeSteelTypeName}
                  </h3>
                </div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 leading-none">
                  {activeCategoryName} • Grade: {activeGradeName}
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-sm text-slate-400 hover:bg-slate-50 hover:text-red-500 p-0"
              onClick={handleConfirmRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Form dropdown selectors */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-b border-slate-100 pb-3">
            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">Category</span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">ENUM</span>
              </div>
              <Select
                value={activeCategoryName}
                options={categoriesList.map(c => ({ value: c.name, label: c.name }))}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="rounded-sm border-border focus:border-primary focus:ring-primary font-inter"
              />
            </div>

            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">Steel Type</span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">ENUM</span>
              </div>
              <Select
                value={activeSteelTypeName}
                options={selectedCategory?.steelTypes.map(s => ({ value: s.name, label: s.name })) || []}
                onChange={(e) => handleSteelTypeChange(e.target.value)}
                className="rounded-sm border-border focus:border-primary focus:ring-primary font-inter"
              />
            </div>

            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">Grade</span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">ENUM</span>
              </div>
              <Select
                value={activeGradeName}
                options={selectedSteelType?.grades.map(g => ({ value: g, label: g })) || []}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="rounded-sm border-border focus:border-primary focus:ring-primary font-inter"
              />
            </div>

            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">Sub-grade</span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">ENUM</span>
              </div>
              <Select
                value={activeSubGradeName}
                options={selectedSteelType?.subGrades.map(sg => ({ value: sg, label: sg })) || []}
                onChange={(e) => handleSubGradeChange(e.target.value)}
                className="rounded-sm border-border focus:border-primary focus:ring-primary font-inter"
              />
            </div>
          </div>

          {/* Form parameters */}
          <div className="grid gap-3 sm:grid-cols-2 border-b border-slate-100 pb-3">
            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">Quantity (kg)</span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">FLOAT</span>
              </div>
              <Input
                type="number"
                value={card.quantity === 0 ? "" : card.quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                placeholder="0.00"
                rightIcon={<span className="text-[10px] font-bold text-slate-400">kg</span>}
                className="rounded-sm border-border focus:border-primary focus:ring-primary font-geist font-bold text-right"
              />
            </div>

            <div className="flex flex-col gap-1 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a] flex items-center gap-1">
                  <span>Price / kg</span>
                  <Badge variant="success" icon={<Lock className="h-2.5 w-2.5" />} className="px-1.5 py-0 rounded-sm text-[8px] border-none font-bold">
                    master
                  </Badge>
                </span>
                <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">INR</span>
              </div>
              <div className="flex h-9.5 w-full items-center justify-between rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-[#10233d]">
                <span className="font-geist font-bold">{inr(computedUnitPrice)}</span>
                {usesRawMaterials && (
                  <Badge variant="info" className="px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700">Alloyed</Badge>
                )}
              </div>
            </div>
          </div>

          {/* RAW MATERIAL INGREDIENTS SECTION */}
          {card.type === "metal" && (
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  <span>Recipe Ingredients</span>
                </h4>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBuilderOpen(true)}
                  className="h-7 px-2.5 rounded-sm text-[10px] font-black border-blue-200 text-blue-600 hover:bg-blue-50/50 uppercase tracking-wider flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  <span>{usesRawMaterials ? "Edit Recipe" : "Add Ingredient"}</span>
                </Button>
              </div>

              {usesRawMaterials ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {mappedRawMaterials.map((item, index) => {
                    const raw = rawMaterialsList.find((rm) => rm.id === item.rawMaterialId);
                    const name = raw?.name || "Ingredient";
                    const pct = item.compositionPct !== undefined ? item.compositionPct.toFixed(1) : "0.0";
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-slate-55 border-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2.5 rounded-sm flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{name}</span>
                        <span className="text-slate-400 font-extrabold font-geist">({pct}%)</span>
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium italic mt-1 text-left">
                  No custom recipe configured. Using standard grade pricing.
                </p>
              )}
            </div>
          )}

          {/* DYNAMIC CALCULATED COST SUMMARY CARD */}
          <div className="rounded-sm bg-jsw-corp p-3 text-white shadow-sm relative overflow-hidden flex flex-col gap-2 mt-1">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
            
            <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-blue-200">
              <span>Calculated Cost Summary</span>
              
              {/* PRIORITY 2: ADD TO SUMMARY WORKFLOW CHIPS */}
              {isAdded ? (
                <Badge variant="success" icon={<CheckCircle className="h-2.5 w-2.5" />} className="bg-emerald-600/30 text-emerald-200 border-none font-bold text-[8px] rounded-sm px-1.5 py-0.5">
                  ✓ Added To Summary
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-yellow-400 animate-spin" />
                  <span className="text-[8px] text-blue-200 font-extrabold uppercase">Draft state</span>
                </div>
              )}
            </div>

            {/* TOTAL COSTING VISUAL CORE DISPLAY */}
            <div className="flex items-center justify-between gap-4 mt-1">
              <div className="flex items-center gap-4.5">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-blue-300 uppercase tracking-wider leading-none">TOTAL COST</span>
                  <strong className="text-lg font-black tracking-tight text-white mt-1 font-geist">
                    {inr(computedTotalCost)}
                  </strong>
                </div>

                <div className="h-6 w-px bg-white/15" />

                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-blue-300 uppercase tracking-wider leading-none">Cost/Kg</span>
                  <span className="text-[11px] font-black text-white mt-1 font-geist">{inr(computedUnitPrice)}/kg</span>
                </div>

                <div className="h-6 w-px bg-white/15" />

                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-blue-300 uppercase tracking-wider leading-none">Cost/Ton</span>
                  <span className="text-[11px] font-black text-white mt-1 font-geist">{inr(computedUnitPrice * 1000)}/t</span>
                </div>
              </div>

              {/* DYNAMIC ADD TO SUMMARY TOGGLE TRIGGERS */}
              {isAdded ? (
                <Button
                  size="sm"
                  onClick={handleRemoveFromSummary}
                  disabled={card.quantity <= 0}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] h-8 px-3 rounded-sm shrink-0 flex items-center gap-1 shadow-md border-none cursor-pointer transition-all"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Remove</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAddToSummary}
                  disabled={card.quantity <= 0}
                  className="bg-jsw-accent hover:bg-blue-700 text-white font-extrabold text-[10px] h-8 px-3 rounded-sm shrink-0 flex items-center gap-1 shadow-md border-none cursor-pointer transition-all"
                >
                  <span>➜ Add To Summary</span>
                </Button>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Recipe Builder Slide-out Drawer */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">
                    Recipe Manager & Builder
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">
                    Configure ingredients for {activeSteelTypeName} ({activeGradeName})
                  </p>
                </div>
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 font-medium text-left">
                  Add and configure the composition percentage of raw material ingredients. The system will automatically calculate target quantities based on the parent card's total volume ({card.quantity} kg).
                </div>
                
                <RawMaterialTable
                  rawMaterials={card.rawMaterials}
                  rawMaterialsList={rawMaterialsList}
                  cardQuantity={card.quantity}
                  onUpdate={handleUpdateRawMaterials}
                />
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-150 bg-slate-50 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Computed Recipe Cost</span>
                  <span className="text-lg font-black text-slate-800 mt-1">{inr(computedTotalCost)}</span>
                </div>
                <Button
                  onClick={() => setIsBuilderOpen(false)}
                  className="bg-[#0b63c8] hover:bg-blue-700 text-white font-extrabold text-xs h-9 px-6 rounded-xl border-none cursor-pointer"
                >
                  Apply & Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
