-- Create admin helper function
CREATE OR REPLACE FUNCTION is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "User" u
        JOIN "Role" r ON u."roleId" = r.id
        WHERE u.id = user_id AND r.name = 'ADMIN'
    );
END;
$$ language 'plpgsql' security definer;

-- 1. Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Calculation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- 2. User Policies
CREATE POLICY user_admin_all ON "User" FOR ALL TO authenticated USING (is_admin(auth.uid()::text));
CREATE POLICY user_select_own ON "User" FOR SELECT TO authenticated USING (auth.uid()::text = id);
CREATE POLICY user_update_own ON "User" FOR UPDATE TO authenticated USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- 3. Calculation Policies
CREATE POLICY calc_admin_all ON "Calculation" FOR ALL TO authenticated USING (is_admin(auth.uid()::text));
CREATE POLICY calc_select_own ON "Calculation" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY calc_insert_own ON "Calculation" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY calc_update_own ON "Calculation" FOR UPDATE TO authenticated USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY calc_delete_own ON "Calculation" FOR DELETE TO authenticated USING (auth.uid()::text = "userId");

-- 4. Report Policies
CREATE POLICY report_admin_all ON "Report" FOR ALL TO authenticated USING (is_admin(auth.uid()::text));
CREATE POLICY report_select_own ON "Report" FOR SELECT TO authenticated USING (auth.uid()::text = "generatedById");
CREATE POLICY report_insert_own ON "Report" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "generatedById");
CREATE POLICY report_update_own ON "Report" FOR UPDATE TO authenticated USING (auth.uid()::text = "generatedById") WITH CHECK (auth.uid()::text = "generatedById");
CREATE POLICY report_delete_own ON "Report" FOR DELETE TO authenticated USING (auth.uid()::text = "generatedById");

-- 5. AuditLog Policies
CREATE POLICY audit_admin_all ON "AuditLog" FOR ALL TO authenticated USING (is_admin(auth.uid()::text));
CREATE POLICY audit_select_own ON "AuditLog" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY audit_insert_all ON "AuditLog" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "userId" OR "userId" IS NULL);

-- 6. Notification Policies
CREATE POLICY notification_admin_all ON "Notification" FOR ALL TO authenticated USING (is_admin(auth.uid()::text));
CREATE POLICY notification_select_own ON "Notification" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY notification_update_own ON "Notification" FOR UPDATE TO authenticated USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");
