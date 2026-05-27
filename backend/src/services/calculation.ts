import { Decimal } from "decimal.js";

export type CostItemInput = {
  id: string;
  name: string;
  quantity: string | number;
  unitPrice: string | number;
  gradeMultiplier?: string | number;
  extraPrice?: string | number;
  compositionPct?: string | number | null;
  gradeName?: string;
  sourceType?: "metal" | "rawMaterial";
};

export type ChargeInput = {
  name: string;
  kind: string;
  rate?: string | number | null;
  amount?: string | number | null;
};

const money = (value: Decimal) => value.toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

export function calculateBreakdown(items: CostItemInput[], charges: ChargeInput[]) {
  if (items.length === 0) {
    throw new Error("At least one costing item is required.");
  }

  const itemRows = items.map((item) => {
    const quantity = new Decimal(item.quantity);
    const unitPrice = new Decimal(item.unitPrice);
    const gradeMultiplier = new Decimal(item.gradeMultiplier ?? 1);
    const extraPrice = new Decimal(item.extraPrice ?? 0);

    if (quantity.lte(0) || unitPrice.lt(0) || gradeMultiplier.lte(0) || extraPrice.lt(0)) {
      throw new Error(`Invalid money or quantity value for ${item.name}.`);
    }

    const baseCost = money(quantity.mul(unitPrice).mul(gradeMultiplier).add(extraPrice));
    return {
      ...item,
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      gradeMultiplier: gradeMultiplier.toString(),
      extraPrice: extraPrice.toString(),
      baseCost: baseCost.toString()
    };
  });

  const baseCost = itemRows.reduce((total, item) => total.add(item.baseCost), new Decimal(0));
  const totalQuantity = itemRows.reduce((total, item) => total.add(item.quantity), new Decimal(0));
  const finalCost = baseCost;

  return {
    items: itemRows,
    charges: [],
    totalQuantity: money(totalQuantity).toString(),
    baseCost: money(baseCost).toString(),
    finalCost: money(finalCost).toString()
  };
}
