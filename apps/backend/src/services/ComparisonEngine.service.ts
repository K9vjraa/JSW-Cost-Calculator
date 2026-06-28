import { RecommendationService } from "./RecommendationService.js";
import type { ComparisonResultDTO, GradeVarianceDTO } from "../types/comparison.dto.js";

export class ComparisonEngine {
  /**
   * Main entry point for the backend comparison engine.
   * Calculates all differences and returns an optimized DTO.
   */
  static calculate(grades: any[], referenceGradeId?: string | null): ComparisonResultDTO {
    if (!grades || grades.length === 0) {
      return {
        referenceGradeId: null,
        grades: [],
        recommendations: [],
        calculatedAt: new Date().toISOString(),
      };
    }

    // Determine reference grade (explicit or fallback to the first item)
    const refId = referenceGradeId || grades[0].id;
    const refGrade = grades.find((g) => g.id === refId) || grades[0];

    const refMetrics = this.calculateBaseMetrics(refGrade);

    const mappedGrades: GradeVarianceDTO[] = grades.map((grade) => {
      const isRef = grade.id === refGrade.id;
      const metrics = this.calculateBaseMetrics(grade);

      const differences = isRef
        ? {
            price: 0,
            cost: 0,
            multiplier: 0,
            material: {},
            chemical: {},
            mechanical: {},
            commercial: {},
          }
        : {
            price: metrics.price - refMetrics.price,
            cost: metrics.cost - refMetrics.cost,
            multiplier: metrics.multiplier - refMetrics.multiplier,
            material: this.calculateJsonVariance(refGrade.gradeMaterials, grade.gradeMaterials),
            chemical: this.calculateJsonVariance(refGrade.chemicalComposition, grade.chemicalComposition),
            mechanical: this.calculateJsonVariance(refGrade.mechanicalProperties, grade.mechanicalProperties),
            commercial: this.calculateJsonVariance(refGrade.toleranceProperties, grade.toleranceProperties),
          };

      const similarity = isRef ? 100 : this.calculateSimilarityScore(refGrade, grade);
      const savings = isRef ? 0 : refMetrics.cost - metrics.cost;
      const recommendation = this.calculateRecommendationScore(grade, metrics.cost);

      return {
        gradeId: grade.id,
        gradeName: grade.name,
        isReference: isRef,
        differences,
        scores: {
          similarity,
          savings,
          recommendation,
        },
        rawValues: {
          price: metrics.price,
          cost: metrics.cost,
          multiplier: metrics.multiplier,
        },
      };
    });

    const recommendations = RecommendationService.generateRecommendations(grades, refId);

    return {
      referenceGradeId: refId,
      grades: mappedGrades,
      recommendations,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper to compute standard base cost values.
   */
  private static calculateBaseMetrics(grade: any) {
    let basePrice = 0;
    if (grade.metal && grade.metal.prices && grade.metal.prices.length > 0) {
      basePrice = Number(grade.metal.prices[0].pricePerUnit);
    } else {
      if (grade.metalId === "metal-ss" || grade.name?.includes("SS")) basePrice = 62.5;
      else if (grade.metalId === "metal-as" || grade.name?.includes("Alloy")) basePrice = 72.0;
      else basePrice = 80.0;
    }

    const mult = Number(grade.multiplier || 1);
    const extra = Number(grade.extraPrice || 0);
    const cost = basePrice * mult + extra;

    return { price: basePrice, multiplier: mult, cost };
  }

  /**
   * Extracts numeric value from strings (e.g. "500 MPa" -> 500)
   */
  private static extractNumber(val: any): number {
    if (typeof val === "number") return val;
    if (typeof val !== "string") return 0;
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Compares two JSON blobs (e.g., chemical properties) and computes the variance.
   */
  private static calculateJsonVariance(refObj: any, curObj: any): Record<string, string | number> {
    const variance: Record<string, string | number> = {};
    const keys = new Set([...Object.keys(refObj || {}), ...Object.keys(curObj || {})]);

    for (const key of keys) {
      const refVal = refObj?.[key];
      const curVal = curObj?.[key];

      const refNum = this.extractNumber(refVal);
      const curNum = this.extractNumber(curVal);

      if (refNum !== 0 || curNum !== 0) {
        variance[key] = curNum - refNum; // Return numeric difference
      } else {
        variance[key] = String(curVal) === String(refVal) ? 0 : `Changed from ${refVal || "None"} to ${curVal || "None"}`;
      }
    }
    return variance;
  }

  /**
   * Calculates a 0-100 Similarity Score based on euclidean distance of properties.
   */
  private static calculateSimilarityScore(ref: any, cur: any): number {
    const rUts = this.extractNumber(ref.mechanicalProperties?.["UTS"]);
    const cUts = this.extractNumber(cur.mechanicalProperties?.["UTS"]);
    const rYield = this.extractNumber(ref.mechanicalProperties?.["Yield strength"]);
    const cYield = this.extractNumber(cur.mechanicalProperties?.["Yield strength"]);

    // Distance normalized assuming max 1000 range
    const distUts = Math.pow((cUts - rUts) / 1000, 2);
    const distYield = Math.pow((cYield - rYield) / 800, 2);
    const dist = Math.sqrt(distUts + distYield);

    // Map distance to a 0-100 score (distance of 0 = 100 score)
    const score = Math.max(0, 100 - dist * 100);
    return Math.round(score * 10) / 10;
  }

  /**
   * Calculates an absolute recommendation score based on quality vs cost.
   */
  private static calculateRecommendationScore(grade: any, cost: number): number {
    const uts = this.extractNumber(grade.mechanicalProperties?.["UTS"]) / 1000;
    const yieldStrength = this.extractNumber(grade.mechanicalProperties?.["Yield strength"]) / 800;
    const quality = (uts + yieldStrength) / 2;

    const value = quality / (cost || 1);
    // Scale up for readability (e.g., 0-100 range roughly)
    const score = Math.min(100, value * 10000);
    return Math.round(score * 10) / 10;
  }
}
