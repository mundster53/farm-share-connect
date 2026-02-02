-- Add Stripe Connect account ID to farms table
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add order status tracking to purchases table
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farms_stripe_account ON public.farms(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_intent ON public.purchases(stripe_payment_intent_id);
