-- ═══════════════════════════════════════════════════════════════════════════
-- DEVELOPER ROLE — Part 2b: remaining get_user_role() policies + audit/activity
--
-- Requires 00047_developer_role.sql to have already been committed (adds the
-- 'DEVELOPER' enum value this migration references throughout). Independent
-- of 00048_developer_role_policies.sql — run in either order, or on its own.
--
-- Self-contained and idempotent: every CREATE POLICY here is preceded by its
-- own DROP POLICY IF EXISTS, so re-running this file is always safe.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- =============================================================================
-- 1. Explicitly add DEVELOPER everywhere ADMIN/SUPER_ADMIN currently appears
--    via get_user_role() (unaffected by the current_user_role() type fix in
--    00048_developer_role_policies.sql — get_user_role() already returns
--    "UserRole", fixed back in migration 00003).
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Only SUPER_ADMIN can insert profiles" ON public.profiles;
CREATE POLICY "Only SUPER_ADMIN can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

DROP POLICY IF EXISTS "Only SUPER_ADMIN can delete profiles" ON public.profiles;
CREATE POLICY "Only SUPER_ADMIN can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

DROP POLICY IF EXISTS "Users can view profiles in scope" ON public.profiles;
CREATE POLICY "Users can view profiles in scope"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

DROP POLICY IF EXISTS "Admins can update non-super-admin profiles" ON public.profiles;
CREATE POLICY "Admins can update non-super-admin profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR (
      public.get_user_role(auth.uid()) = 'ADMIN'
      AND role::text <> 'SUPER_ADMIN'
    )
    OR public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER')
  );

-- ── assignment_history ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ADMIN can manage assignment history" ON public.assignment_history;
CREATE POLICY "ADMIN can manage assignment history"
  ON public.assignment_history FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── equipment_assignments ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins view all assignments" ON public.equipment_assignments;
CREATE POLICY "Admins view all assignments"
  ON public.equipment_assignments FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
    OR "employeeId" = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can insert assignments" ON public.equipment_assignments;
CREATE POLICY "Admins can insert assignments"
  ON public.equipment_assignments FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

DROP POLICY IF EXISTS "Admins can update assignments" ON public.equipment_assignments;
CREATE POLICY "Admins can update assignments"
  ON public.equipment_assignments FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

DROP POLICY IF EXISTS "Super admins can delete assignments" ON public.equipment_assignments;
CREATE POLICY "Super admins can delete assignments"
  ON public.equipment_assignments FOR DELETE
  USING (
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER')
  );

-- ── employee_contracts ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins view all contracts" ON public.employee_contracts;
CREATE POLICY "Admins view all contracts"
  ON public.employee_contracts FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
    OR "profileId" = auth.uid()
  );

DROP POLICY IF EXISTS "Admins manage contracts" ON public.employee_contracts;
CREATE POLICY "Admins manage contracts"
  ON public.employee_contracts FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── attendance_logs ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Employees view own attendance" ON public.attendance_logs;
CREATE POLICY "Employees view own attendance"
  ON public.attendance_logs FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
    OR "employeeId" = auth.uid()
  );

DROP POLICY IF EXISTS "Admins manage attendance" ON public.attendance_logs;
CREATE POLICY "Admins manage attendance"
  ON public.attendance_logs FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- "Employees can update own clock" and "Employees can self-log attendance"
-- are EMPLOYEE-scoped only (self-service, not an admin/developer check) —
-- left untouched.

-- ── payroll_records ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Employees view own payroll" ON public.payroll_records;
CREATE POLICY "Employees view own payroll"
  ON public.payroll_records FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
    OR "employeeId" = auth.uid()
  );

DROP POLICY IF EXISTS "Admins manage payroll" ON public.payroll_records;
CREATE POLICY "Admins manage payroll"
  ON public.payroll_records FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── attendance_settings ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins view settings" ON public.attendance_settings;
CREATE POLICY "Admins view settings"
  ON public.attendance_settings FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

DROP POLICY IF EXISTS "Super admins manage settings" ON public.attendance_settings;
CREATE POLICY "Super admins manage settings"
  ON public.attendance_settings FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

-- ── client_services ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Super admin can manage client services" ON public.client_services;
CREATE POLICY "Super admin can manage client services"
  ON public.client_services FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

-- ── studio_booking_charges / booking_assignees ───────────────────────────
DROP POLICY IF EXISTS "Super Admins can manage charges" ON public.studio_booking_charges;
CREATE POLICY "Super Admins can manage charges" ON public.studio_booking_charges FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

DROP POLICY IF EXISTS "Super Admins can manage assignees" ON public.booking_assignees;
CREATE POLICY "Super Admins can manage assignees" ON public.booking_assignees FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'DEVELOPER'));

-- =============================================================================
-- 2. Audit/activity visibility flips from SUPER_ADMIN-only to DEVELOPER-only.
--    A real SUPER_ADMIN's own logins/clicks/data-changes are still recorded
--    (DEVELOPER is the only role excluded from tracking), so letting
--    SUPER_ADMIN read these tables would let them view a trail that includes
--    themselves — deliberately restricted to DEVELOPER instead.
-- =============================================================================

DROP POLICY IF EXISTS "Only SUPER_ADMIN can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only developers can view audit logs" ON public.audit_logs;
CREATE POLICY "Only developers can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'DEVELOPER');

DROP POLICY IF EXISTS "Super Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Only developers can view all sessions" ON public.user_sessions;
CREATE POLICY "Only developers can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'DEVELOPER');

DROP POLICY IF EXISTS "Super Admins can view all click events" ON public.click_events;
DROP POLICY IF EXISTS "Only developers can view all click events" ON public.click_events;
CREATE POLICY "Only developers can view all click events"
  ON public.click_events FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'DEVELOPER');

COMMIT;
