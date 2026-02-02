-- Fix 1: Remove public access to profiles (PII)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Public profiles are viewable'
  ) THEN
    EXECUTE 'DROP POLICY "Public profiles are viewable" ON public.profiles';
  END IF;
END$$;

-- Fix 2: Allow farm owners to update purchases for their farms
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'share_purchases'
      AND policyname = 'Farm owners can update purchases for their farms'
  ) THEN
    EXECUTE 'DROP POLICY "Farm owners can update purchases for their farms" ON public.share_purchases';
  END IF;
END$$;

CREATE POLICY "Farm owners can update purchases for their farms"
ON public.share_purchases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.farms
    WHERE farms.id = share_purchases.farm_id
      AND farms.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.farms
    WHERE farms.id = share_purchases.farm_id
      AND farms.owner_id = auth.uid()
  )
);