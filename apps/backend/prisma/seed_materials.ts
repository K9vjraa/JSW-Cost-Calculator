import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const officialMaterials = [
  { material_rawMatId: 1 "FAALWRS010", material_alloyName: "Al_Wire", description: "Al Wire" },
  { material_rawMatId: 1 "FAALSH9802", material_alloyName: "Al Shots", description: "Al Shots" },
  { material_rawMatId: 1 "FAALCBP061", material_alloyName: "Al_Cubes", description: "Al Cubes" },
  { material_rawMatId: 1 "FAFEAL0012", material_alloyName: "FeAl", description: "Ferro Aluminium" },
  { material_rawMatId: 1 "FAGRPW0039", material_alloyName: "Gr Powder", description: "Graphite Powder" },
  { material_rawMatId: 1 "FACAFW0026", material_alloyName: "CaFe", description: "CaFe Wire" },
  { material_rawMatId: 1 "4100003509", material_alloyName: "LCC", description: "LCC" },
  { material_rawMatId: 1 "FAALBP0007", material_alloyName: "Al_Bar", description: "Aluminium Ingots" },
  { material_rawMatId: 1 "FACPCO0051", material_alloyName: "CPC", description: "Calcined Petro Coke" },
  { material_rawMatId: 1 "FACASW0025", material_alloyName: "CaSi", description: "Ca-Si Wire" },
  { material_rawMatId: 1 "FACOPR0025", material_alloyName: "Cu", description: "Copper" },
  { material_rawMatId: 1 "FASMEL0005", material_alloyName: "ELCSIMN", description: "Si Mn Elc" },
  { material_rawMatId: 1 "FAFCHC0019", material_alloyName: "FeCr-HC", description: "HC Ferro Chrome" },
  { material_rawMatId: 1 "FAFCLCS020", material_alloyName: "FeCr-LC", description: "LC Ferro Chrome" },
  { material_rawMatId: 1 "FAFEMO0018", material_alloyName: "FEMO", description: "Ferro Molybdenum" },
  { material_rawMatId: 1 "FAFENB0013", material_alloyName: "FeNb", description: "Ferro Niobium" },
  { material_rawMatId: 1 "FAFEPH0022", material_alloyName: "FeP", description: "Ferro Phosphorus" },
  { material_rawMatId: 1 "FAFESI0007", material_alloyName: "FeSi", description: "Ferro Silicon" },
  { material_rawMatId: 1 "FAFETH0016", material_alloyName: "FeTi(70%)", description: "Ferro Titanium 70%" },
  { material_rawMatId: 1 "FAHCFM0002", material_alloyName: "HCMN", description: "HC Ferro Manganese" },
  { material_rawMatId: 1 "FALCMN0043", material_alloyName: "LCMN", description: "LC Ferro Manganese" },
  { material_rawMatId: 1 "INH_CAL_LIME", material_alloyName: "LIME", description: "Lime" },
  { material_rawMatId: 1 "FAMCFM0029", material_alloyName: "MCMN", description: "MC Ferro Manganese" },
  { material_rawMatId: 1 "FAMNMT0004", material_alloyName: "MET_MN", description: "Manganese Metal" },
  { material_rawMatId: 1 "FANISQ0023", material_alloyName: "Ni", description: "Nickel Square" },
  { material_rawMatId: 1 "SLAG_SYNTH", material_alloyName: "Syn_Slag", description: "Synthetic Slag" },
  { material_rawMatId: 1 "FASIMN0001", material_alloyName: "SiMn", description: "Silico Manganese" },
  { material_rawMatId: 1 "FAFEBO0021", material_alloyName: "FeB", description: "Ferro Boron" },
  { material_rawMatId: 1 "FACAFEAL_W_P", material_alloyName: "CaFeAl", description: "CaFeAl" },
  { material_rawMatId: 1 "4100005806", material_alloyName: "Ca_Carbide", description: "Ca_Carbide" },
  { material_rawMatId: 1 "FAFEVH0014", material_alloyName: "FeV", description: "Ferro Vanadium" },
  { material_rawMatId: 1 "FAFEBOW021", material_alloyName: "Fe_B_Wire", description: "Fe_B_Wire" },
  { material_rawMatId: 1 "FAFENTV056", material_alloyName: "NitroVan", description: "NitroVan" },
  { material_rawMatId: 1 "FACHCAL054", material_alloyName: "Pure_Ca", description: "Pure_Ca" }
];

const microAlloys = ["FAFEVH0014", "FAFENB0013", "FAFEBO0021", "FAFETH0016"];

async function main() {
  console.log("Starting seed of official JSW Material Master...");

  for (const mat of officialMaterials) {
    const isMicroAlloy = microAlloys.includes(mat.material_code);
    
    await prisma.rawMaterial.upsert({
      where: { rawMatId: 1 mat.material_code },
      update: {
        alloyName: mat.material_name,
        description: mat.description,
        category: "FERRO_ALLOY",
        unit: "kg",
        isAvail: true,
        isMicro: isMicroAlloy
      },
      create: {
        rawMatId: 1 mat.material_code,
        alloyName: mat.material_name,
        description: mat.description,
        category: "FERRO_ALLOY",
        unit: "kg",
        isAvail: true,
        isMicro: isMicroAlloy,
        status: "ACTIVE"
      }
    });
    console.log(`Upserted material: ${mat.material_code} - ${mat.material_name}`);
  }
  
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
