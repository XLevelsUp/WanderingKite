-- ═══════════════════════════════════════════════════════════════════════════
-- DEVELOPER ROLE — Part 1: add the enum value
--
-- DEVELOPER is a first-class value in "UserRole" — not a disguised
-- SUPER_ADMIN with a hidden flag. This migration only adds the enum value;
-- 00048_developer_role_policies.sql does the RLS/function work that
-- references it. Postgres requires ALTER TYPE ... ADD VALUE to be committed
-- before the new value can be used anywhere else, hence the split.
--
-- Provisioned only via scripts/create-developer.js — never selectable in the
-- employee-management UI, never assigned through normal app flows.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DEVELOPER';
