-- Progressive disclosure for waitlist: buyers must explicitly opt-in before farm owners can see identifying info.

-- 1) Add consent flag
ALTER TABLE public.buyer_waitlist
ADD COLUMN IF NOT EXISTS allow_contact boolean NOT NULL DEFAULT false;

-- 2) Let buyers change only their own consent flag (and other fields if you later allow)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'buyer_waitlist'
      AND policyname = 'Users can update their waitlist entries'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their waitlist entries" ON public.buyer_waitlist';
  END IF;
END$$;

CREATE POLICY "Users can update their waitlist entries"
ON public.buyer_waitlist
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3) Remove direct farm-owner SELECT on the raw table (prevents access to user_id/zip_code columns)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'buyer_waitlist'
      AND policyname = 'Farm owners can view waitlist for their farms'
  ) THEN
    EXECUTE 'DROP POLICY "Farm owners can view waitlist for their farms" ON public.buyer_waitlist';
  END IF;
END$$;

-- 4) Provide a safe, server-side accessor for farm owners
--    - Verifies caller owns the farm
--    - Returns masked location + buyer identifier only when allow_contact = true
CREATE OR REPLACE FUNCTION public.get_farm_waitlist(_farm_id uuid)
RETURNS TABLE (
  id uuid,
  farm_id uuid,
  desired_portion public.share_portion,
  zip_area text,
  max_distance integer,
  created_at timestamptz,
  buyer_user_id uuid,
  allow_contact boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.farms f
    WHERE f.id = _farm_id
      AND f.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    w.id,
    w.farm_id,
    w.desired_portion,
    CASE
      WHEN w.zip_code IS NULL OR length(w.zip_code) < 3 THEN NULL
      ELSE substring(w.zip_code, 1, 3) || 'XX'
    END AS zip_area,
    w.max_distance,
    w.created_at,
    CASE WHEN w.allow_contact THEN w.user_id ELSE NULL END AS buyer_user_id,
    w.allow_contact
  FROM public.buyer_waitlist w
  WHERE w.farm_id = _farm_id
  ORDER BY w.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_farm_waitlist(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farm_waitlist(uuid) TO authenticated;