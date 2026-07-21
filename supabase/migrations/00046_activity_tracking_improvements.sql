-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITY TRACKING — follow-up fixes after first real-world use:
-- 1. Server-side click leaderboard aggregation (was pulling up to 5000 raw
--    rows and reducing them in JS on every page load).
-- 2. Retention cleanup for click_events (was unbounded growth, appended to
--    on every click app-wide with nothing pruning old rows).
-- ═══════════════════════════════════════════════════════════════════════════

-- Aggregate click_events server-side instead of shipping raw rows to JS.
CREATE OR REPLACE FUNCTION public.get_click_leaderboard(p_days INT DEFAULT NULL)
RETURNS TABLE (label TEXT, path TEXT, click_count BIGINT) AS $$
  SELECT label, path, COUNT(*) AS click_count
  FROM public.click_events
  WHERE p_days IS NULL OR created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY label, path
  ORDER BY click_count DESC
  LIMIT 50;
$$ LANGUAGE sql STABLE;

-- Deletes click_events older than 6 months. No pg_cron dependency — invoked
-- opportunistically from the app layer (see actions/activity.ts) so it
-- self-maintains without requiring infra-level scheduling. If pg_cron is
-- available on your Supabase plan, `SELECT cron.schedule(...)` this instead
-- for a guaranteed daily run.
CREATE OR REPLACE FUNCTION public.cleanup_old_click_events()
RETURNS VOID AS $$
  DELETE FROM public.click_events WHERE created_at < NOW() - INTERVAL '6 months';
$$ LANGUAGE sql SECURITY DEFINER;
