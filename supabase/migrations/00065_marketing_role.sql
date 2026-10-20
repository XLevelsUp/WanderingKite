-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETING ROLE — Part 1: add the enum value.
--
-- Split into its own migration for the same reason as 00047 (DEVELOPER):
-- Postgres cannot use a newly-added enum value inside the transaction that
-- adds it. 00066 creates the blog tables whose policies reference
-- 'MARKETING', and must run after this one commits.
--
-- MARKETING is deliberately NOT a rung on the existing privilege ladder
-- (EMPLOYEE < ADMIN < SUPER_ADMIN < DEVELOPER). It is a sideways role with
-- access to blog routes only — see the ROLE_ROUTE_ALLOWLIST in lib/access.ts.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MARKETING';
