import type { Grade, Metal, RawMaterial } from "@/types";
import type { CalculationCardState } from "@/components/CalculationCard";
import { defaultJswCategories } from "@/components/CalculationCard";

// Pure frontend calculation logic

/**
 * Material Amount = Qty * Rate
 */
export function calculateMaterialAmount(qty: number, rate: number): number {
  return qty * rate;
}

/**
 * Calculates Card Total = Sum(Material Amount) for a given card
 */
export function calculateCardCost(
  card: CalculationCardState,
  metals: Metal[],
  grades: Grade[],
  rawMaterials: RawMaterial[],
  categoriesList = defaultJswCategories
): {
  cardTotal: number;
  unitPrice: number;
  isAlloyed: boolean;
  mappedRawMaterials: { id: string; rawMaterialId: string; quantity: number; compositionPct?: number }[];
} {
  // Retrieve selected JSW elements from card state values
  const activeCategoryName = card.categoryName || "MS Hot Rolled";
  const activeSteelTypeName = card.steelTypeName || "HR Coil E250A";
  const activeGradeName = card.gradeName || "E250A";

  const selectedCategory = categoriesList.find((c) => c.name === activeCategoryName) || categoriesList[0];
  const selectedSteelType =
    selectedCategory?.steelTypes.find((s) => s.name === activeSteelTypeName) ||
    selectedCategory?.steelTypes?.[0];

  const activeGrade =
    grades.find(
      (g) =>
        g.id === card.gradeId ||
        g.name.toLowerCase() === activeGradeName.toLowerCase()
    ) || grades[0];

  const activeMetal =
    metals.find((m) => m.id === card.metalId || m.id === activeGrade?.metalId) ||
    metals[0];

  const metalBasePrice = activeMetal?.prices?.[0]?.pricePerUnit
    ? Number(activeMetal.prices[0].pricePerUnit)
    : selectedSteelType?.basePrice || 0;
  
  const gradeMultiplier = activeGrade ? Number(activeGrade.multiplier) : 1;
  const gradeExtraPrice = activeGrade ? Number(activeGrade.extraPrice) : 0;

  const standardUnitPrice = metalBasePrice * gradeMultiplier + gradeExtraPrice;
  const standardTotalCost = calculateMaterialAmount(card.quantity, standardUnitPrice);

  const mappedRawMaterials = card.rawMaterials.map((item) => {
    if (item.compositionPct !== undefined) return item;
    const pct =
      card.type !== "raw_material" && card.quantity > 0
        ? (item.quantity / card.quantity) * 100
        : 0;
    return { ...item, compositionPct: pct };
  });

  const rawMaterialsTotalCost = mappedRawMaterials.reduce((total, item) => {
    const raw = rawMaterials.find((rm) => rm.id === item.rawMaterialId);
    const rawPrice = Number(
      (raw as unknown as Record<string, unknown>)?.currentRate ?? raw?.prices?.[0]?.pricePerUnit ?? 0
    );
    const qty =
      card.type === "raw_material"
        ? item.quantity
        : card.quantity > 0
        ? (item.compositionPct! / 100) * card.quantity
        : item.quantity;
    return total + calculateMaterialAmount(qty, rawPrice);
  }, 0);

  const isAlloyed = card.rawMaterials.length > 0;

  let computedTotalCost = standardTotalCost;
  if (card.type === "raw_material" || isAlloyed) {
    computedTotalCost = rawMaterialsTotalCost;
  }

  let computedUnitPrice = standardUnitPrice;
  if (card.type === "raw_material" || isAlloyed) {
    computedUnitPrice = card.quantity > 0 ? rawMaterialsTotalCost / card.quantity : 0;
  }

  return {
    cardTotal: computedTotalCost,
    unitPrice: computedUnitPrice,
    isAlloyed,
    mappedRawMaterials,
  };
}

/**
 * Workspace Total = Sum(All Cards)
 */
export function calculateWorkspaceTotals(
  cards: CalculationCardState[],
  metals: Metal[],
  grades: Grade[],
  rawMaterials: RawMaterial[],
  categoriesList = defaultJswCategories
): {
  workspaceTotal: number;
  totalQuantity: number;
  averageCostPerKg: number;
} {
  let workspaceTotal = 0;
  let totalQuantity = 0;

  for (const card of cards) {
    const { cardTotal } = calculateCardCost(card, metals, grades, rawMaterials, categoriesList);
    workspaceTotal += cardTotal;
    totalQuantity += card.quantity;
  }

  const averageCostPerKg = totalQuantity > 0 ? workspaceTotal / totalQuantity : 0;

  return {
    workspaceTotal,
    totalQuantity,
    averageCostPerKg,
  };
}
