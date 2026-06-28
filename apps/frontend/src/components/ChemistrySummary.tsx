export interface ChemistrySummaryProps {
  composition?: Record<string, any>;
}

const ELEMENT_MAP: Record<string, string> = {
  carbon: "C",
  manganese: "Mn",
  silicon: "Si",
  sulfur: "S",
  phosphorus: "P",
  aluminum: "Al",
  copper: "Cu",
  nickel: "Ni",
  chromium: "Cr",
  molybdenum: "Mo",
  niobium: "Nb",
  titanium: "Ti",
  vanadium: "V",
  boron: "B",
  nitrogen: "N"
};

export function ChemistrySummary({ composition }: ChemistrySummaryProps) {
  // Default values to simulate ERP dummy data if none provided
  const defaultChem = { "carbon": "0.15%", "manganese": "0.80%", "silicon": "0.20%" };
  
  const chem = (composition && typeof composition === "object" && Object.keys(composition).length > 0) 
    ? composition 
    : defaultChem;

  // Helper to get full name from abbreviation or vice-versa
  const getFullName = (key: string) => {
    const lowerKey = key.toLowerCase();
    // If it's already a full name in our map keys, just capitalize it
    if (ELEMENT_MAP[lowerKey]) {
      return lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
    }
    // If it's an abbreviation (like 'C', 'Mn'), find the key
    const foundEntry = Object.entries(ELEMENT_MAP).find(([_, val]) => val.toLowerCase() === lowerKey);
    if (foundEntry) {
      return foundEntry[0].charAt(0).toUpperCase() + foundEntry[0].slice(1);
    }
    // Fallback to original
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="flex flex-col gap-2 min-w-[130px] w-full">
      {Object.entries(chem).slice(0, 3).map(([element, value]) => {
        const elementName = getFullName(element);
        const percentage = parseFloat((value as string).replace('%', '')) || 0;
        
        // Mock visual progress bar logic
        const visualMultiplier = percentage < 1 ? 100 : percentage < 5 ? 20 : 5;
        const width = Math.min(percentage * visualMultiplier, 100);

        return (
          <div key={element} className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-700 capitalize leading-none tracking-tight">
              {elementName}
            </span>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0b5cbf] rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 shrink-0 text-right leading-none w-9">
                {value as string}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
