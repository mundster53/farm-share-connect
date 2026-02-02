-- Farmer role request workflow (buyer -> request farmer access -> admin approves)

-- 1) Status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'farmer_request_status') THEN
    CREATE TYPE public.farmer_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- 2) Requests table
CREATE TABLE IF NOT EXISTS public.farmer_role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status public.farmer_request_status NOT NULL DEFAULT 'pending',
  note text NULL,
  admin_note text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Keep updated_at current
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_farmer_role_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_farmer_role_requests_updated_at
    BEFORE UPDATE ON public.farmer_role_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) Prevent multiple pending requests per user
CREATE UNIQUE INDEX IF NOT EXISTS farmer_role_requests_one_pending_per_user
  ON public.farmer_role_requests(user_id)
  WHERE status = 'pending';

-- 5) Enable RLS
ALTER TABLE public.farmer_role_requests ENABLE ROW LEVEL SECURITY;

-- 6) Policies
DO $$
BEGIN
  -- drop if exists to keep migration idempotent-ish
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farmer_role_requests' AND policyname='Users can create their farmer role requests') THEN
    EXECUTE 'DROP POLICY "Users can create their farmer role requests" ON public.farmer_role_requests';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farmer_role_requests' AND policyname='Users can view their farmer role requests') THEN
    EXECUTE 'DROP POLICY "Users can view their farmer role requests" ON public.farmer_role_requests';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='farmer_role_requests' AND policyname='Admins can view all farmer role requests') THEN
    EXECUTE 'DROP POLICY "Admins can view all farmer role requests" ON public.farmer_role_requests';
  END IF;
END$$;

CREATE POLICY "Users can create their farmer role requests"
ON public.farmer_role_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their farmer role requests"
ON public.farmer_role_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all farmer role requests"
ON public.farmer_role_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Note: No UPDATE policy: changes are done via SECURITY DEFINER review function only.

-- 7) Function: request farmer role (validated server-side)
CREATE OR REPLACE FUNCTION public.request_farmer_role(_note text DEFAULT NULL)
RETURNS public.farmer_role_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_existing public.farmer_role_requests;
  v_created public.farmer_role_requests;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _note IS NOT NULL AND length(_note) > 500 THEN
    RAISE EXCEPTION 'Note must be 500 characters or less';
  END IF;

  SELECT * INTO v_existing
  FROM public.farmer_role_requests
  WHERE user_id = v_uid
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_existing;
  END IF;

  INSERT INTO public.farmer_role_requests (user_id, note)
  VALUES (v_uid, nullif(btrim(_note), ''))
  RETURNING * INTO v_created;

  RETURN v_created;
END;
$$;

REVOKE ALL ON FUNCTION public.request_farmer_role(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_farmer_role(text) TO authenticated;

-- 8) Function: admin review request (approved/rejected)
CREATE OR REPLACE FUNCTION public.review_farmer_role_request(
  _request_id uuid,
  _decision public.farmer_request_status,
  _admin_note text DEFAULT NULL
)
RETURNS public.farmer_role_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_req public.farmer_role_requests;
  v_updated public.farmer_role_requests;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT public.has_role(v_uid, 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _decision NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;

  IF _admin_note IS NOT NULL AND length(_admin_note) > 500 THEN
    RAISE EXCEPTION 'Admin note must be 500 characters or less';
  END IF;

  SELECT * INTO v_req
  FROM public.farmer_role_requests
  WHERE id = _request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  UPDATE public.farmer_role_requests
  SET status = _decision,
      admin_note = nullif(btrim(_admin_note), ''),
      updated_at = now()
  WHERE id = _request_id
  RETURNING * INTO v_updated;

  IF _decision = 'approved' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_req.user_id, 'farmer')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.review_farmer_role_request(uuid, public.farmer_request_status, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_farmer_role_request(uuid, public.farmer_request_status, text) TO authenticated;
