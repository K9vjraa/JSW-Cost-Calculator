export type CellStatus = 'best' | 'worst' | 'changed' | 'same' | 'none';

interface FormatResult {
  status: CellStatus;
  styleClass: string;
}

// Map status to Tailwind classes for enterprise highlighting
const statusStyles: Record<CellStatus, string> = {
  best: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]',
  worst: 'bg-rose-50 text-rose-800 border-rose-200 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.2)]',
  changed: 'bg-amber-50/70 text-amber-800 border-amber-200 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]',
  same: 'bg-slate-50 text-slate-500',
  none: 'bg-transparent text-slate-700' // fallback
};

/**
 * Extracts a numeric value from a formatted string.
 * E.g., "500 MPa" -> 500, "₹ 45.00 / kg" -> 45.00, "±0.05" -> 0.05
 */
export function extractNumber(val: any): number | null {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;
  
  // Remove currency symbols, commas, and letters, but keep minus, plus, period, and numbers
  // Note: we'll handle "±" by stripping it and treating as absolute number
  const cleaned = val.replace(/[₹$,a-zA-Z\s/]/g, '').replace('±', '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Evaluates a cell's value against the rest of the row to determine its conditional format.
 * @param cellValue The string/number value of the current cell
 * @param rowValues All values in the current row (object mapped by gradeId)
 * @param groupId The group this row belongs to (e.g. "cost", "mechanical", "tolerances")
 * @param referenceGradeId (Optional) If a baseline is selected
 * @param gradeId The ID of the current grade being evaluated
 * @returns FormatResult with status and Tailwind classes
 */
export function evaluateCellFormat(
  cellValue: any,
  rowValues: Record<string, any>,
  groupId: string,
  referenceGradeId: string | null,
  gradeId: string
): FormatResult {
  // 1. If there's only one grade or value is missing, return none
  const allValues = Object.values(rowValues).filter(v => v !== undefined && v !== null && v !== "-" && v !== "N/A");
  if (allValues.length <= 1 || cellValue === "-" || cellValue === "N/A") {
    return { status: 'none', styleClass: statusStyles.none };
  }

  // 2. Check for identical values across the board
  const allIdentical = allValues.every(v => v === allValues[0]);
  if (allIdentical) {
    return { status: 'same', styleClass: statusStyles.same };
  }

  // 3. If there is a reference grade, we compare against it
  if (referenceGradeId) {
    const refValue = rowValues[referenceGradeId];
    if (gradeId === referenceGradeId) {
       // The reference grade itself is styled as baseline (usually we just return none and let table handle it, or same)
       return { status: 'none', styleClass: statusStyles.none }; 
    }
    
    // If it perfectly matches the reference, it's the "same"
    if (cellValue === refValue) {
      return { status: 'same', styleClass: statusStyles.same };
    }
  }

  // 4. Numeric evaluation for Best/Worst
  const cellNum = extractNumber(cellValue);
  const numericValues = allValues.map(extractNumber).filter(n => n !== null) as number[];

  if (cellNum !== null && numericValues.length === allValues.length) {
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    
    // Determine what is "best" based on the group
    let isBest = false;
    let isWorst = false;

    if (groupId === "cost") {
      // Lower cost is best
      isBest = cellNum === min;
      isWorst = cellNum === max;
    } else if (groupId === "mechanical") {
      // Higher strength/elongation is best
      isBest = cellNum === max;
      isWorst = cellNum === min;
    } else if (groupId === "tolerances") {
      // Lower tolerance (absolute value) is best
      isBest = cellNum === min;
      isWorst = cellNum === max; // Assuming larger tolerance is worse
    } else if (groupId === "chemical") {
      // Hard to say what chemical % is better without context, just mark changed
      return { status: 'changed', styleClass: statusStyles.changed };
    }

    if (isBest && isWorst) {
       // if min == max, but we already caught allIdentical above.
       return { status: 'changed', styleClass: statusStyles.changed };
    }

    if (isBest) return { status: 'best', styleClass: statusStyles.best };
    if (isWorst) return { status: 'worst', styleClass: statusStyles.worst };
    
    // If it's a number but not best/worst, it's just changed
    return { status: 'changed', styleClass: statusStyles.changed };
  }

  // 5. String Evaluation (e.g. Bend Rating: "Excellent", "Good", "Fair")
  if (typeof cellValue === 'string') {
    const valUpper = cellValue.toUpperCase();
    if (valUpper.includes('EXCELLENT')) return { status: 'best', styleClass: statusStyles.best };
    if (valUpper.includes('POOR') || valUpper.includes('FAIR')) return { status: 'worst', styleClass: statusStyles.worst };
  }

  // Fallback for any other differences
  return { status: 'changed', styleClass: statusStyles.changed };
}
