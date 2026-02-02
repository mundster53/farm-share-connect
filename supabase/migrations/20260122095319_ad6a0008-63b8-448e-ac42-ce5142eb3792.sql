-- Tighten privileges on SECURITY DEFINER functions by preventing anonymous execution.
-- These functions are still usable where needed (e.g., policies/triggers) but cannot be called by anon.

-- has_role(user_id, role): used in RLS; allow authenticated callers only.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- handle_new_user(): trigger-only; no need for direct execution by clients.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;