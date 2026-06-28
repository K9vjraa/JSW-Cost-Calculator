import type { RecommendationCard } from "../services/RecommendationService.js";

export interface ComparisonResultDTO {
  referenceGradeId: string | null;
  grades: GradeVarianceDTO[];
  recommendations: RecommendationCard[];
  calculatedAt: string;
}

export interface GradeVarianceDTO {
  gradeId: string;
  gradeName: string;
  isReference: boolean;
  differences: {
    price: number;
    cost: number;
    multiplier: number;
    material: Record<string, string | number>;
    chemical: Record<string, string | number>;
    mechanical: Record<string, string | number>;
    commercial: Record<string, string | number>;
  };
  scores: {
    similarity: number;
    savings: number;
    recommendation: number;
  };
  rawValues: {
    price: number;
    cost: number;
    multiplier: number;
  };
}
