/**
 * Custom robust CSV Parser for MCMS.
 * Correctly handles:
 * - Commas within double-quoted fields
 * - Double-quotes escaped as double-double-quotes ("")
 * - Trimmed spaces
 * - Multiple line-ending styles (\r\n vs \n)
 */
export function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double-quote inside quotes
        currentVal += '"';
        i++; // skip the next quote
      } else {
        // Toggle quotes state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip standard Windows CR/LF second char
      }
      row.push(currentVal.trim());
      // Skip empty blank lines
      if (row.length > 1 || row[0] !== "") {
        result.push(row);
      }
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  // Push final line if file didn't end with a trailing newline
  if (currentVal !== "" || row.length > 0) {
    row.push(currentVal.trim());
    if (row.length > 1 || row[0] !== "") {
      result.push(row);
    }
  }

  return result;
}
