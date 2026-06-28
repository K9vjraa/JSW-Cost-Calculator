-- Remove GST Slab table (not used in this project)
DROP TABLE IF EXISTS "GstSlab";

-- Remove gstAmount column from Calculation table (GST not applicable)
ALTER TABLE "Calculation" DROP COLUMN IF EXISTS "gstAmount";
