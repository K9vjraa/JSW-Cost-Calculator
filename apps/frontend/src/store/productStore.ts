import { create } from "zustand";
import type { Grade, Metal, RawMaterial } from "@/types";
import { defaultJswCategories, type JSWCategory } from "../components/CalculationCard";
import { metals as staticMetals, rawMaterials as staticRawMaterials, grades as staticGrades } from "../data/fixtures";
import { getOrFixture } from "../services/api";

// ── High-Fidelity JSW Grade Specifications Database ─────────────────────────
export const jswGradeSpecs: Record<string, {
  mechanicalProperties: Record<string, string>;
  chemicalComposition: Record<string, string>;
  toleranceProperties: Record<string, string>;
  bendProperties: Record<string, string>;
}> = {
  E250A: {
    mechanicalProperties: { "UTS (Tensile)": "410 MPa", "Yield Strength": "250 MPa", "Elongation": "23%" },
    chemicalComposition: { "C (Carbon)": "0.22%", "Mn (Manganese)": "1.50%", "S (Sulfur)": "0.045%", "P (Phosphorus)": "0.045%", "Si (Silicon)": "0.40%" },
    toleranceProperties: { "Thickness": "+/- 0.05 mm", "Flatness Tolerance": "Standard", "Width Range": "+/- 2.0 mm" },
    bendProperties: { "Min Bend Radius": "1.5T", "Formability Rating": "Excellent", "Flanging": "Good" }
  },
  E275: {
    mechanicalProperties: { "UTS (Tensile)": "430 MPa", "Yield Strength": "275 MPa", "Elongation": "22%" },
    chemicalComposition: { "C (Carbon)": "0.20%", "Mn (Manganese)": "1.50%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "Si (Silicon)": "0.40%" },
    toleranceProperties: { "Thickness": "+/- 0.05 mm", "Flatness Tolerance": "Standard" },
    bendProperties: { "Min Bend Radius": "1.8T", "Formability Rating": "Good" }
  },
  E350: {
    mechanicalProperties: { "UTS (Tensile)": "490 MPa", "Yield Strength": "350 MPa", "Elongation": "21%" },
    chemicalComposition: { "C (Carbon)": "0.20%", "Mn (Manganese)": "1.60%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "Si (Silicon)": "0.45%" },
    toleranceProperties: { "Thickness": "+/- 0.06 mm", "Flatness Tolerance": "Tight", "Width Range": "+/- 2.5 mm" },
    bendProperties: { "Min Bend Radius": "2.0T", "Formability Rating": "Good", "Drawability": "Fair" }
  },
  E410: {
    mechanicalProperties: { "UTS (Tensile)": "540 MPa", "Yield Strength": "410 MPa", "Elongation": "19%" },
    chemicalComposition: { "C (Carbon)": "0.20%", "Mn (Manganese)": "1.60%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "Si (Silicon)": "0.45%", "Nb (Niobium)": "0.08%" },
    toleranceProperties: { "Thickness": "+/- 0.07 mm", "Flatness Tolerance": "Extra Straight" },
    bendProperties: { "Min Bend Radius": "2.5T", "Formability Rating": "Fair" }
  },
  E250: {
    mechanicalProperties: { "UTS (Tensile)": "410 MPa", "Yield Strength": "250 MPa", "Elongation": "23%" },
    chemicalComposition: { "C (Carbon)": "0.23%", "Mn (Manganese)": "1.50%", "S (Sulfur)": "0.050%", "P (Phosphorus)": "0.050%" },
    toleranceProperties: { "Thickness": "+/- 0.08 mm", "Flatness Tolerance": "Standard" },
    bendProperties: { "Min Bend Radius": "1.5T", "Formability Rating": "Excellent" }
  },
  D: {
    mechanicalProperties: { "UTS (Tensile)": "270-410 MPa", "Yield Strength": "240 MPa", "Elongation": "30%" },
    chemicalComposition: { "C (Carbon)": "0.12%", "Mn (Manganese)": "0.50%", "S (Sulfur)": "0.035%", "P (Phosphorus)": "0.035%" },
    toleranceProperties: { "Thickness": "+/- 0.03 mm", "Flatness Tolerance": "Extra Flat" },
    bendProperties: { "Min Bend Radius": "0.5T", "Formability Rating": "Superb", "Drawability": "Excellent" }
  },
  DD: {
    mechanicalProperties: { "UTS (Tensile)": "270-380 MPa", "Yield Strength": "220 MPa", "Elongation": "33%" },
    chemicalComposition: { "C (Carbon)": "0.10%", "Mn (Manganese)": "0.45%", "S (Sulfur)": "0.030%", "P (Phosphorus)": "0.030%" },
    toleranceProperties: { "Thickness": "+/- 0.03 mm", "Flatness Tolerance": "Precision Flat" },
    bendProperties: { "Min Bend Radius": "Flat", "Formability Rating": "Deep Drawing Grade" }
  },
  EDD: {
    mechanicalProperties: { "UTS (Tensile)": "270-350 MPa", "Yield Strength": "180 MPa", "Elongation": "38%" },
    chemicalComposition: { "C (Carbon)": "0.08%", "Mn (Manganese)": "0.40%", "S (Sulfur)": "0.025%", "P (Phosphorus)": "0.025%" },
    toleranceProperties: { "Thickness": "+/- 0.02 mm", "Flatness Tolerance": "Laser Flat" },
    bendProperties: { "Min Bend Radius": "Flat", "Formability Rating": "Extra Deep Drawing Elite" }
  },
  Fe500D: {
    mechanicalProperties: { "UTS (Tensile)": "565 MPa", "Yield Strength": "500 MPa", "Elongation": "16%", "Total Elongation (Uniform)": "12%" },
    chemicalComposition: { "C (Carbon)": "0.25%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "S+P Content": "0.075%" },
    toleranceProperties: { "Weight Tolerance": "+/- 3.0%", "Rib Pitch": "Standard", "Diameter Precision": "+/- 0.5 mm" },
    bendProperties: { "Mandrel Diameter (Bend)": "3D", "Mandrel (Re-bend)": "5D", "Rating": "Highly Ductile Seismic Grade" }
  },
  Fe550D: {
    mechanicalProperties: { "UTS (Tensile)": "600 MPa", "Yield Strength": "550 MPa", "Elongation": "14.5%" },
    chemicalComposition: { "C (Carbon)": "0.25%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "S+P Content": "0.075%", "Mn (Manganese)": "1.0%" },
    toleranceProperties: { "Weight Tolerance": "+/- 3.0%", "Rib Pitch": "Tight" },
    bendProperties: { "Mandrel Diameter (Bend)": "4D", "Mandrel (Re-bend)": "6D" }
  },
  Fe600: {
    mechanicalProperties: { "UTS (Tensile)": "660 MPa", "Yield Strength": "600 MPa", "Elongation": "10%" },
    chemicalComposition: { "C (Carbon)": "0.30%", "S (Sulfur)": "0.040%", "P (Phosphorus)": "0.040%", "Mn (Manganese)": "1.2%" },
    toleranceProperties: { "Weight Tolerance": "+/- 2.5%", "Rib Pitch": "Extra Tight" },
    bendProperties: { "Mandrel Diameter (Bend)": "5D", "Mandrel (Re-bend)": "7D" }
  },
  GP: {
    mechanicalProperties: { "UTS (Tensile)": "340 MPa", "Yield Strength": "250 MPa", "Elongation": "20%" },
    chemicalComposition: { "Zn Coating Mass": "120 gsm", "Fe base": ">99.0%", "C": "0.15%" },
    toleranceProperties: { "Thickness": "+/- 0.04 mm", "Coating Adhesion": "Triple Spot Test compliant" },
    bendProperties: { "Min Bend Radius": "1.0T", "Formability Rating": "Good Spangle Lock" }
  },
  GC: {
    mechanicalProperties: { "UTS (Tensile)": "320 MPa", "Yield Strength": "240 MPa", "Elongation": "22%" },
    chemicalComposition: { "Zn Coating Mass": "90 gsm", "Fe base": ">99.2%" },
    toleranceProperties: { "Thickness": "+/- 0.04 mm", "Flatness": "Corrugated Standard" },
    bendProperties: { "Min Bend Radius": "0.5T", "Formability Rating": "Excellent Roof Formability" }
  },
  GL: {
    mechanicalProperties: { "UTS (Tensile)": "350 MPa", "Yield Strength": "260 MPa", "Elongation": "20%" },
    chemicalComposition: { "Al Coating Mass": "55%", "Zn Coating Mass": "43.5%", "Si Coating Mass": "1.5%" },
    toleranceProperties: { "Thickness": "+/- 0.03 mm", "Corrosion Resistance": "Salt Spray 1000 hrs compliant" },
    bendProperties: { "Min Bend Radius": "1.0T", "Formability": "High Thermal Reflectivity Grade" }
  },
  SAE1006: {
    mechanicalProperties: { "UTS (Tensile)": "330 MPa", "Yield Strength": "285 MPa", "Elongation": "28%" },
    chemicalComposition: { "C (Carbon)": "0.06%", "Mn (Manganese)": "0.35%", "S (Sulfur)": "0.020%", "P (Phosphorus)": "0.020%" },
    toleranceProperties: { "Diameter Tolerance": "+/- 0.15 mm", "Out of Roundness": "< 0.10 mm" },
    bendProperties: { "Min Bend Radius": "0.2D", "Drawing Suitability": "Super Fine Wire Drawing" }
  },
  SAE1008: {
    mechanicalProperties: { "UTS (Tensile)": "340 MPa", "Yield Strength": "290 MPa", "Elongation": "26%" },
    chemicalComposition: { "C (Carbon)": "0.08%", "Mn (Manganese)": "0.45%", "S (Sulfur)": "0.025%", "P (Phosphorus)": "0.025%" },
    toleranceProperties: { "Diameter Tolerance": "+/- 0.15 mm", "Out of Roundness": "< 0.10 mm" },
    bendProperties: { "Min Bend Radius": "0.3D", "Drawing Suitability": "Medium Wire Drawing" }
  },
  EN8D: {
    mechanicalProperties: { "UTS (Tensile)": "620 MPa", "Yield Strength": "320 MPa", "Elongation": "16%", "Hardness": "200 BHN" },
    chemicalComposition: { "C (Carbon)": "0.42%", "Mn (Manganese)": "0.80%", "Si (Silicon)": "0.25%", "S (Sulfur)": "0.035%", "P (Phosphorus)": "0.035%" },
    toleranceProperties: { "Diameter Tolerance": "+/- 0.20 mm", "Straightness": "Standard" },
    bendProperties: { "Forgeability": "Excellent", "Machinability Rating": "Good (Medium Tensile)" }
  },
  EN9: {
    mechanicalProperties: { "UTS (Tensile)": "700 MPa", "Yield Strength": "355 MPa", "Elongation": "12%", "Hardness": "230 BHN" },
    chemicalComposition: { "C (Carbon)": "0.55%", "Mn (Manganese)": "0.75%", "Si (Silicon)": "0.25%", "S (Sulfur)": "0.035%", "P (Phosphorus)": "0.035%" },
    toleranceProperties: { "Diameter Tolerance": "+/- 0.25 mm", "Straightness": "Straight Grade" },
    bendProperties: { "Wear Resistance": "High", "Machinability Rating": "Fair (Hard Wearing Axle Steel)" }
  }
};

export interface ProductState {
  categories: JSWCategory[];
  metals: Metal[];
  grades: Grade[];
  rawMaterials: RawMaterial[];
  isLoading: boolean;
  
  setCategories: (categories: JSWCategory[]) => void;
  setMetals: (metals: Metal[]) => void;
  setGrades: (grades: Grade[]) => void;
  setRawMaterials: (rawMaterials: RawMaterial[]) => void;
  fetchCatalog: () => Promise<void>;
  
  // Custom utility helper to resolve high-fidelity grade specs reactively
  getGradeSpecs: (gradeName: string) => Grade | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  categories: defaultJswCategories,
  metals: staticMetals,
  grades: staticGrades,
  rawMaterials: staticRawMaterials,
  isLoading: false,

  setCategories: (categories) => set({ categories }),
  setMetals: (metals) => set({ metals }),
  setGrades: (grades) => set({ grades }),
  setRawMaterials: (rawMaterials) => set({ rawMaterials }),

  fetchCatalog: async () => {
    set({ isLoading: true });
    try {
      const metalsRes = await getOrFixture<{ data: Metal[] }>("/metals?limit=100", { data: staticMetals });
      const gradesRes = await getOrFixture<{ data: Grade[] }>("/grades?limit=100", { data: staticGrades });
      const rawRes = await getOrFixture<{ data: RawMaterial[] }>("/raw-materials?limit=100", { data: staticRawMaterials });
      
      set({ 
        metals: metalsRes.data || [], 
        grades: gradesRes.data || [], 
        rawMaterials: rawRes.data || [],
        isLoading: false
      });
    } catch (err) {
      console.error("Failed to sync JSW master catalog", err);
      set({ isLoading: false });
    }
  },

  getGradeSpecs: (gradeName: string) => {
    const { grades } = get();
    // 1. Try to find grade specs from static list
    const found = grades.find(g => g.name.toLowerCase() === gradeName.toLowerCase() || g.name.toLowerCase().includes(gradeName.toLowerCase()));
    
    // 2. Map dynamic JSW specifications to match Grade format
    const spec = jswGradeSpecs[gradeName];
    if (spec) {
      return {
        id: found?.id || `grade-${gradeName.toLowerCase()}`,
        name: gradeName,
        metalId: found?.metalId || "metal-ss",
        multiplier: found?.multiplier || "1.0",
        extraPrice: found?.extraPrice || "0",
        metal: found?.metal || { name: "JSW Steel", category: "Ferrous", prices: [] },
        ...spec
      } as Grade;
    }
    
    return found || grades[0] || null;
  }
}));

export default useProductStore;
