import type { Grade, Price } from "@jsw-mcms/types";

export interface RecommendationCard {
  type: 'LOWEST_COST' | 'HIGHEST_QUALITY' | 'BEST_VALUE' | 'MOST_SIMILAR' | 'MOST_EXPENSIVE' | 'CHEAPEST';
  gradeId: string;
  gradeName: string;
  title: string;
  description: string;
  metricValue: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger';
}

/**
 * Extracts a numeric value from a string (e.g. "500 MPa" -> 500)
 */
function extractNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates the total unit price for a grade.
 */
function calculateUnitPrice(grade: any): number {
  let basePrice = 0;
  if (grade.metal && grade.metal.prices && grade.metal.prices.length > 0) {
    basePrice = Number(grade.metal.prices[0].pricePerUnit);
  } else {
    // Fallback if price is missing in the database structure
    if (grade.metalId === "metal-ss" || grade.name.includes("SS")) basePrice = 62.50;
    else if (grade.metalId === "metal-as" || grade.name.includes("Alloy")) basePrice = 72.00;
    else basePrice = 80.00;
  }
  
  const mult = Number(grade.multiplier || 1);
  const extra = Number(grade.extraPrice || 0);
  return (basePrice * mult) + extra;
}

/**
 * Calculates a normalized quality score based on mechanical properties.
 * Higher is better.
 */
function calculateQualityScore(grade: any): number {
  const uts = extractNumber(grade.mechanicalProperties?.["UTS"]);
  const yieldStrength = extractNumber(grade.mechanicalProperties?.["Yield strength"]);
  const elongation = extractNumber(grade.mechanicalProperties?.["Elongation"]);
  
  // Normalize (very rough heuristic for demo)
  // Assuming UTS ~ 300-1500, Yield ~ 200-1200, Elongation ~ 1-50
  const normUts = uts / 1000;
  const normYield = yieldStrength / 800;
  const normElongation = elongation / 20;

  return (normUts + normYield + normElongation) / 3;
}

export class RecommendationService {
  /**
   * Generates recommendations based on an array of fully-populated Grade objects.
   */
  static generateRecommendations(grades: any[], referenceGradeId?: string | null): RecommendationCard[] {
    if (!grades || grades.length === 0) return [];

    const recommendations: RecommendationCard[] = [];

    // Map all grades to their computed metrics
    const metrics = grades.map(g => {
      const cost = calculateUnitPrice(g);
      const quality = calculateQualityScore(g);
      const valueScore = quality / (cost || 1); // prevent div by zero
      return { grade: g, cost, quality, valueScore };
    });

    // 1. CHEAPEST / LOWEST COST
    const cheapest = [...metrics].sort((a, b) => a.cost - b.cost)[0];
    if (cheapest) {
      recommendations.push({
        type: 'LOWEST_COST',
        gradeId: cheapest.grade.id,
        gradeName: cheapest.grade.name,
        title: 'Lowest Cost',
        description: `Provides the absolute lowest baseline price at ₹${cheapest.cost.toFixed(2)}/kg, minimizing overall material expenditure.`,
        metricValue: `₹${cheapest.cost.toFixed(2)}`,
        badgeType: 'success'
      });
    }

    // 2. MOST EXPENSIVE
    const mostExpensive = [...metrics].sort((a, b) => b.cost - a.cost)[0];
    if (mostExpensive && mostExpensive.grade.id !== cheapest.grade.id) {
      recommendations.push({
        type: 'MOST_EXPENSIVE',
        gradeId: mostExpensive.grade.id,
        gradeName: mostExpensive.grade.name,
        title: 'Premium Material',
        description: `The most expensive option at ₹${mostExpensive.cost.toFixed(2)}/kg. Ensure application requirements justify the premium.`,
        metricValue: `₹${mostExpensive.cost.toFixed(2)}`,
        badgeType: 'warning'
      });
    }

    // 3. HIGHEST QUALITY
    const highestQuality = [...metrics].sort((a, b) => b.quality - a.quality)[0];
    if (highestQuality) {
      const uts = highestQuality.grade.mechanicalProperties?.["UTS"] || "superior";
      recommendations.push({
        type: 'HIGHEST_QUALITY',
        gradeId: highestQuality.grade.id,
        gradeName: highestQuality.grade.name,
        title: 'Highest Quality',
        description: `Delivers the best overall mechanical performance with an Ultimate Tensile Strength (UTS) of ${uts}.`,
        metricValue: `Score: ${(highestQuality.quality * 100).toFixed(0)}`,
        badgeType: 'info'
      });
    }

    // 4. BEST VALUE (Cost Performance)
    const bestValue = [...metrics].sort((a, b) => b.valueScore - a.valueScore)[0];
    // Don't duplicate if cheapest is also best value
    if (bestValue && bestValue.grade.id !== cheapest.grade.id && bestValue.grade.id !== highestQuality.grade.id) {
      recommendations.push({
        type: 'BEST_VALUE',
        gradeId: bestValue.grade.id,
        gradeName: bestValue.grade.name,
        title: 'Best Value',
        description: `Offers the optimal balance between high mechanical performance and cost efficiency.`,
        metricValue: 'Optimal',
        badgeType: 'success'
      });
    }

    // 5. MOST SIMILAR GRADE (If reference provided)
    if (referenceGradeId) {
      const refGrade = metrics.find(m => m.grade.id === referenceGradeId);
      const candidates = metrics.filter(m => m.grade.id !== referenceGradeId);
      
      if (refGrade && candidates.length > 0) {
        // Calculate Euclidean distance based on cost and quality for simplicity
        const refCost = refGrade.cost;
        const refQual = refGrade.quality;

        let mostSimilar = candidates[0];
        let minDistance = Infinity;

        for (const cand of candidates) {
          // Normalize the distance calculation slightly
          const costDist = Math.pow((cand.cost - refCost) / (refCost || 1), 2);
          const qualDist = Math.pow((cand.quality - refQual) / (refQual || 1), 2);
          const distance = Math.sqrt(costDist + qualDist);
          
          if (distance < minDistance) {
            minDistance = distance;
            mostSimilar = cand;
          }
        }

        recommendations.push({
          type: 'MOST_SIMILAR',
          gradeId: mostSimilar.grade.id,
          gradeName: mostSimilar.grade.name,
          title: 'Most Similar Grade',
          description: `Shares the closest cost-to-performance profile with the selected Baseline Reference.`,
          metricValue: `${(100 - minDistance * 100).toFixed(1)}% Match`,
          badgeType: 'info'
        });
      }
    }

    // Take top 4 recommendations to fit the UI nicely
    return recommendations.slice(0, 4);
  }
}
