-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'buyer');

-- Create enum for share portions
CREATE TYPE public.share_portion AS ENUM ('1/8', '1/4', '1/2', 'whole');

-- Create enum for purchase status
CREATE TYPE public.purchase_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  is_farmer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create farms table for farmer listings
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  badge TEXT,
  is_grass_fed BOOLEAN DEFAULT false,
  is_organic BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create available_shares table for shares offered by farms
CREATE TABLE public.available_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  portion share_portion NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  weight_estimate TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  next_available_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create share_purchases table for buyer transactions
CREATE TABLE public.share_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id UUID NOT NULL REFERENCES public.available_shares(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  portion share_portion NOT NULL,
  price_paid DECIMAL(10, 2) NOT NULL,
  status purchase_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buyer_waitlist for matching buyers
CREATE TABLE public.buyer_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  desired_portion share_portion NOT NULL,
  zip_code TEXT,
  max_distance INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, farm_id, desired_portion)
);

-- Create memberships table for subscription tracking
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('buyer', 'farmer')),
  tier TEXT,
  price_paid DECIMAL(10, 2) NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  -- Assign default buyer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_available_shares_updated_at
  BEFORE UPDATE ON public.available_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_share_purchases_updated_at
  BEFORE UPDATE ON public.share_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for farms (public read, owner write)
CREATE POLICY "Farms are viewable by everyone"
  ON public.farms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Farm owners can insert their farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Farm owners can update their farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Farm owners can delete their farms"
  ON public.farms FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for available_shares
CREATE POLICY "Shares are viewable by everyone"
  ON public.available_shares FOR SELECT
  USING (true);

CREATE POLICY "Farm owners can manage their shares"
  ON public.available_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = farm_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Farm owners can update their shares"
  ON public.available_shares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = farm_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Farm owners can delete their shares"
  ON public.available_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = farm_id AND owner_id = auth.uid()
    )
  );

-- RLS Policies for share_purchases
CREATE POLICY "Buyers can view their purchases"
  ON public.share_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Farm owners can view purchases for their farms"
  ON public.share_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = farm_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create purchases"
  ON public.share_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their pending purchases"
  ON public.share_purchases FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'pending');

-- RLS Policies for buyer_waitlist
CREATE POLICY "Users can view their waitlist entries"
  ON public.buyer_waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Farm owners can view waitlist for their farms"
  ON public.buyer_waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = farm_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join waitlist"
  ON public.buyer_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist"
  ON public.buyer_waitlist FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for memberships
CREATE POLICY "Users can view their memberships"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);