-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables tracking updates
CREATE TRIGGER update_User_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_Metal_updated_at BEFORE UPDATE ON "Metal" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_Grade_updated_at BEFORE UPDATE ON "Grade" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_RawMaterial_updated_at BEFORE UPDATE ON "RawMaterial" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_Alloy_updated_at BEFORE UPDATE ON "Alloy" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_Supplier_updated_at BEFORE UPDATE ON "Supplier" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_PriceList_updated_at BEFORE UPDATE ON "PriceList" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_Calculation_updated_at BEFORE UPDATE ON "Calculation" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_SystemSetting_updated_at BEFORE UPDATE ON "SystemSetting" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_GstSlab_updated_at BEFORE UPDATE ON "GstSlab" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_MechanicalProperty_updated_at BEFORE UPDATE ON "MechanicalProperty" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ChemicalProperty_updated_at BEFORE UPDATE ON "ChemicalProperty" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ComparisonRecord_updated_at BEFORE UPDATE ON "ComparisonRecord" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_JswProductCatalog_updated_at BEFORE UPDATE ON "JswProductCatalog" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
