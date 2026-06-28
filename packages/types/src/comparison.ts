export interface RecommendationCard {
  type: 'LOWEST_COST' | 'HIGHEST_QUALITY' | 'BEST_VALUE' | 'MOST_SIMILAR' | 'MOST_EXPENSIVE' | 'CHEAPEST';
  gradeId: string;
  gradeName: string;
  title: string;
  description: string;
  metricValue: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger';
}

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
    chemical?: Record<string, string | number>;
    mechanical?: Record<string, string | number>;
    commercial?: Record<string, string | number>;
  };
}

export interface ComparisonSession {
  id: string;
  name: string;
  description?: string;
  items: any[];
}