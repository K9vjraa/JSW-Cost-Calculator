-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('COSTING_DEPARTMENT', 'PDQC'))
);

-- 2. Insert New Roles
INSERT INTO public."Role" (id, name, description, "createdAt")
VALUES 
  ('role-costing-dept', 'COSTING_DEPARTMENT', 'Costing Department (Full Access)', NOW()),
  ('role-pdqc', 'PDQC', 'PDQC Team (Limited Access)', NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Map Existing Users and Clean Up Roles
UPDATE public."User" 
SET "roleId" = 'role-costing-dept'
WHERE "roleId" = (SELECT id FROM public."Role" WHERE name = 'ADMIN');

UPDATE public."User" 
SET "roleId" = 'role-pdqc'
WHERE "roleId" IN (SELECT id FROM public."Role" WHERE name IN ('EMPLOYEE', 'USER'));

DELETE FROM public."Role" WHERE name IN ('ADMIN', 'EMPLOYEE', 'USER');

-- 4. Re-define Helper Functions
DROP FUNCTION IF EXISTS public.is_admin(text);

CREATE OR REPLACE FUNCTION public.is_costing_department(user_id text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public."User" u
        JOIN public."Role" r ON u."roleId" = r.id
        WHERE u.id = user_id AND r.name = 'COSTING_DEPARTMENT'
    );
END;
$$ language 'plpgsql' security definer;

CREATE OR REPLACE FUNCTION public.is_pdqc(user_id text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public."User" u
        JOIN public."Role" r ON u."roleId" = r.id
        WHERE u.id = user_id AND r.name = 'PDQC'
    );
END;
$$ language 'plpgsql' security definer;

-- 5. Drop Old Policies
DROP POLICY IF EXISTS user_admin_all ON public."User";
DROP POLICY IF EXISTS calc_admin_all ON public."Calculation";
DROP POLICY IF EXISTS report_admin_all ON public."Report";
DROP POLICY IF EXISTS audit_admin_all ON public."AuditLog";
DROP POLICY IF EXISTS notification_admin_all ON public."Notification";

-- 6. Create New Policies on Existing RLS Tables
CREATE POLICY user_costing_dept_all ON public."User" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY calc_costing_dept_all ON public."Calculation" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY report_costing_dept_all ON public."Report" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY audit_costing_dept_all ON public."AuditLog" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY notification_costing_dept_all ON public."Notification" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- 7. Enable RLS and Policies on Remaining 18 Tables
-- Role
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_select_all ON public."Role" FOR SELECT TO authenticated USING (true);
CREATE POLICY role_costing_dept_all ON public."Role" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- Metal
ALTER TABLE public."Metal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY metal_select_all ON public."Metal" FOR SELECT TO authenticated USING (true);
CREATE POLICY metal_costing_dept_all ON public."Metal" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- Grade
ALTER TABLE public."Grade" ENABLE ROW LEVEL SECURITY;
CREATE POLICY grade_select_all ON public."Grade" FOR SELECT TO authenticated USING (true);
CREATE POLICY grade_costing_dept_all ON public."Grade" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- RawMaterial
ALTER TABLE public."RawMaterial" ENABLE ROW LEVEL SECURITY;
CREATE POLICY raw_material_select_all ON public."RawMaterial" FOR SELECT TO authenticated USING (true);
CREATE POLICY raw_material_costing_dept_all ON public."RawMaterial" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- Alloy
ALTER TABLE public."Alloy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY alloy_select_all ON public."Alloy" FOR SELECT TO authenticated USING (true);
CREATE POLICY alloy_costing_dept_all ON public."Alloy" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- AlloyComponent
ALTER TABLE public."AlloyComponent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY alloy_comp_select_all ON public."AlloyComponent" FOR SELECT TO authenticated USING (true);
CREATE POLICY alloy_comp_costing_dept_all ON public."AlloyComponent" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- Supplier
ALTER TABLE public."Supplier" ENABLE ROW LEVEL SECURITY;
CREATE POLICY supplier_select_all ON public."Supplier" FOR SELECT TO authenticated USING (true);
CREATE POLICY supplier_costing_dept_all ON public."Supplier" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- PriceList
ALTER TABLE public."PriceList" ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_list_select_all ON public."PriceList" FOR SELECT TO authenticated USING (true);
CREATE POLICY price_list_costing_dept_all ON public."PriceList" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- PriceHistory
ALTER TABLE public."PriceHistory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_history_select_all ON public."PriceHistory" FOR SELECT TO authenticated USING (true);
CREATE POLICY price_history_costing_dept_all ON public."PriceHistory" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- CalculationItem
ALTER TABLE public."CalculationItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY calc_item_select_all ON public."CalculationItem" FOR SELECT TO authenticated USING (true);
CREATE POLICY calc_item_costing_dept_all ON public."CalculationItem" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY calc_item_pdqc_all ON public."CalculationItem" FOR ALL TO authenticated 
  USING (
    is_pdqc(auth.uid()::text) AND 
    EXISTS (
      SELECT 1 FROM public."Calculation" c 
      WHERE c.id = "calculationId" AND c."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    is_pdqc(auth.uid()::text) AND 
    EXISTS (
      SELECT 1 FROM public."Calculation" c 
      WHERE c.id = "calculationId" AND c."userId" = auth.uid()::text
    )
  );

-- SystemSetting
ALTER TABLE public."SystemSetting" ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_setting_select_all ON public."SystemSetting" FOR SELECT TO authenticated USING (true);
CREATE POLICY system_setting_costing_dept_all ON public."SystemSetting" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- GstSlab
ALTER TABLE public."GstSlab" ENABLE ROW LEVEL SECURITY;
CREATE POLICY gst_slab_select_all ON public."GstSlab" FOR SELECT TO authenticated USING (true);
CREATE POLICY gst_slab_costing_dept_all ON public."GstSlab" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- MechanicalProperty
ALTER TABLE public."MechanicalProperty" ENABLE ROW LEVEL SECURITY;
CREATE POLICY mech_prop_select_all ON public."MechanicalProperty" FOR SELECT TO authenticated USING (true);
CREATE POLICY mech_prop_costing_dept_all ON public."MechanicalProperty" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- ChemicalProperty
ALTER TABLE public."ChemicalProperty" ENABLE ROW LEVEL SECURITY;
CREATE POLICY chem_prop_select_all ON public."ChemicalProperty" FOR SELECT TO authenticated USING (true);
CREATE POLICY chem_prop_costing_dept_all ON public."ChemicalProperty" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- ComparisonRecord
ALTER TABLE public."ComparisonRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY comparison_select_all ON public."ComparisonRecord" FOR SELECT TO authenticated USING (true);
CREATE POLICY comparison_costing_dept_all ON public."ComparisonRecord" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
CREATE POLICY comparison_pdqc_all ON public."ComparisonRecord" FOR ALL TO authenticated 
  USING (is_pdqc(auth.uid()::text) AND auth.uid()::text = "userId")
  WITH CHECK (is_pdqc(auth.uid()::text) AND auth.uid()::text = "userId");

-- JswProductCatalog
ALTER TABLE public."JswProductCatalog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_select_all ON public."JswProductCatalog" FOR SELECT TO authenticated USING (true);
CREATE POLICY catalog_costing_dept_all ON public."JswProductCatalog" FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));

-- RefreshToken
ALTER TABLE public."RefreshToken" ENABLE ROW LEVEL SECURITY;
CREATE POLICY refresh_token_all ON public."RefreshToken" FOR ALL TO authenticated
  USING (auth.uid()::text = "userId" OR is_costing_department(auth.uid()::text))
  WITH CHECK (auth.uid()::text = "userId" OR is_costing_department(auth.uid()::text));

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_costing_dept_all ON public.profiles FOR ALL TO authenticated USING (is_costing_department(auth.uid()::text)) WITH CHECK (is_costing_department(auth.uid()::text));
