import { Decimal } from "decimal.js";
import { z } from "zod";
import { auditService } from "./audit.service.js";

// Set precision configuration
Decimal.set({ precision: 18, rounding: Decimal.ROUND_HALF_UP });

/**
 * Zod Schemas for Input Validation
 */
export const CalculationInputSchema = z.object({
  quantity: z.number().positive("Quantity must be positive"),
  materials: z.array(z.object({
    id: z.string().uuid("Invalid material ID"),
    name: z.string().min(1),
    weight: z.number().nonnegative(),
  })).min(1, "At least one base material is required"),
  rates: z.record(z.string().uuid(), z.number().nonnegative("Rate must be non-negative")),
  composition: z.array(z.object({
    materialId: z.string().uuid("Invalid composition material ID"),
    percentage: z.number().min(0).max(100),
  })).optional().default([]),
  adjustments: z.array(z.object({
    name: z.string(),
    type: z.enum(["FLAT", "PERCENTAGE"]),
    value: z.number(),
  })).optional().default([]),
  userId: z.string().uuid("Invalid user ID").optional(),
});

export type CalculationInput = z.infer<typeof CalculationInputSchema>;

export interface CalculationOutput {
  baseCost: string;
  additivesCost: string;
  adjustments: string;
  subtotal: string;
  totalCost: string;
  costPerKg: string;
}

/**
 * Format Decimal to 4 decimal places string
 */
const money = (val: Decimal): string => val.toDecimalPlaces(4).toString();

export class CalculationEngineService {
  /**
   * Executes the calculation with strict validation and precision.
   */
  public static calculate(input: CalculationInput): CalculationOutput {
    // 1. Validation
    const validated = CalculationInputSchema.parse(input);

    const quantity = new Decimal(validated.quantity);
    let baseCost = new Decimal(0);
    let additivesCost = new Decimal(0);
    let adjustmentsTotal = new Decimal(0);

    // 2. Base Cost
    for (const material of validated.materials) {
      const rate = new Decimal(validated.rates[material.id] ?? 0);
      const weight = new Decimal(material.weight);
      baseCost = baseCost.plus(weight.times(rate));
    }

    // 3. Additives Cost
    // Additive quantity = total quantity * (percentage / 100)
    for (const comp of validated.composition) {
      const compQuantity = quantity.times(new Decimal(comp.percentage).dividedBy(100));
      const rate = new Decimal(validated.rates[comp.materialId] ?? 0);
      additivesCost = additivesCost.plus(compQuantity.times(rate));
    }

    // 4. Subtotal
    const subtotal = baseCost.plus(additivesCost);

    // 5. Adjustments
    for (const adj of validated.adjustments) {
      if (adj.type === "FLAT") {
        adjustmentsTotal = adjustmentsTotal.plus(new Decimal(adj.value));
      } else if (adj.type === "PERCENTAGE") {
        const percentAmount = subtotal.times(new Decimal(adj.value).dividedBy(100));
        adjustmentsTotal = adjustmentsTotal.plus(percentAmount);
      }
    }

    // 6. Total Cost & Cost per KG
    const totalCost = subtotal.plus(adjustmentsTotal);
    const costPerKg = quantity.isZero() ? new Decimal(0) : totalCost.dividedBy(quantity);

    const output: CalculationOutput = {
      baseCost: money(baseCost),
      additivesCost: money(additivesCost),
      adjustments: money(adjustmentsTotal),
      subtotal: money(subtotal),
      totalCost: money(totalCost),
      costPerKg: money(costPerKg),
    };

    // 7. Audit Logging
    auditService.logEvent({
      userId: validated.userId,
      action: "CALCULATION_ENGINE_RUN",
      resource: "CalculationEngine",
      status: "SUCCESS",
    });

    return output;
  }
}
