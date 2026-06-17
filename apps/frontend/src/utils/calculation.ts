import { grades as staticGrades, metals as staticMetals, rawMaterials as staticRawMaterials } from "@/data/fixtures";
import type { Grade, Metal, RawMaterial, Breakdown } from "@/types";

export type Mode = "metal" | "alloy" | "raw-material";

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
  _mode: Mode = "alloy",
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
      ? row.rawMaterials.reduce((sum: number, rm) => {
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
