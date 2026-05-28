import { Decimal } from "decimal.js";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  kind: "GST" | "ADDITIONAL";
  /** Rate as a percentage of base cost (e.g. 18 for 18% GST) */
  rate?: string | number | null;
  /** Fixed flat amount in base currency */
  amount?: string | number | null;
  taxable?: boolean;
};

export type ChargeResult = ChargeInput & {
  computedAmount: string;
  isCredit: boolean;
};

export type BreakdownResult = {
  items: Array<CostItemInput & {
    quantity: string;
    unitPrice: string;
    gradeMultiplier: string;
    extraPrice: string;
    baseCost: string;
  }>;
  charges: ChargeResult[];
  totalQuantity: string;
  baseCost: string;
  chargesTotal: string;
  gstAmount: string;
  finalCost: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const D = (v: string | number | null | undefined) => new Decimal(v ?? 0);
const money = (v: Decimal) => v.toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

// ── Core Engine ───────────────────────────────────────────────────────────────

/**
 * Calculate a simplified metal cost breakdown.
 *
 * Formula:
 *   TotalCost = BaseCost + GST + AdditionalCharges
 */
export function calculateBreakdown(
  items: CostItemInput[],
  charges: ChargeInput[]
): BreakdownResult {
  if (items.length === 0) {
    throw new Error("At least one costing item is required.");
  }

  // ── Step 1: Item rows ──────────────────────────────────────────────────────
  const itemRows = items.map((item) => {
    const quantity = D(item.quantity);
    const unitPrice = D(item.unitPrice);
    const gradeMultiplier = D(item.gradeMultiplier ?? 1);
    const extraPrice = D(item.extraPrice ?? 0);

    if (quantity.lte(0) || unitPrice.lt(0) || gradeMultiplier.lte(0) || extraPrice.lt(0)) {
      throw new Error(`Invalid money or quantity value for "${item.name}".`);
    }

    // baseCost = (quantity × unitPrice × gradeMultiplier) + extraPrice
    const baseCost = money(quantity.mul(unitPrice).mul(gradeMultiplier).add(extraPrice));

    return {
      ...item,
      quantity: money(quantity).toString(),
      unitPrice: money(unitPrice).toString(),
      gradeMultiplier: money(gradeMultiplier).toString(),
      extraPrice: money(extraPrice).toString(),
      baseCost: baseCost.toString()
    };
  });

  const baseCost = money(
    itemRows.reduce((sum, row) => sum.add(row.baseCost), new Decimal(0))
  );
  const totalQuantity = money(
    itemRows.reduce((sum, row) => sum.add(row.quantity), new Decimal(0))
  );

  // ── Step 2: Charge processing ──────────────────────────────────────────────
  let gstAmount = new Decimal(0);
  let additionalTotal = new Decimal(0);

  const chargeResults: ChargeResult[] = charges.map((charge) => {
    const rate = D(charge.rate);
    const flat = D(charge.amount);
    let computed = new Decimal(0);
    let isCredit = false;

    switch (charge.kind) {
      case "GST": {
        computed = rate.gt(0)
          ? money(baseCost.mul(rate).div(100))
          : money(flat);
        gstAmount = gstAmount.add(computed);
        break;
      }
      case "ADDITIONAL": {
        computed = money(flat.gt(0) ? flat : baseCost.mul(rate).div(100));
        additionalTotal = additionalTotal.add(computed);
        break;
      }
    }

    return {
      ...charge,
      computedAmount: money(computed).toString(),
      isCredit
    };
  });

  // ── Step 3: Final cost ─────────────────────────────────────────────────────
  const chargesTotal = money(gstAmount.add(additionalTotal));
  const finalCost = money(baseCost.add(chargesTotal));

  return {
    items: itemRows,
    charges: chargeResults,
    totalQuantity: totalQuantity.toString(),
    baseCost: baseCost.toString(),
    chargesTotal: chargesTotal.toString(),
    gstAmount: money(gstAmount).toString(),
    finalCost: finalCost.toString()
  };
}

// ── Defaults from settings map ────────────────────────────────────────────────

/**
 * Build default GST charge array from SystemSetting key/value store.
 */
export function defaultChargesFromSettings(
  settings: Record<string, string>
): ChargeInput[] {
  const charges: ChargeInput[] = [];

  const gstRate = Number(settings["default_gst_rate"] ?? 0);
  if (gstRate > 0) {
    charges.push({ name: `GST @ ${gstRate}%`, kind: "GST", rate: gstRate, taxable: true });
  }

  return charges;
}

