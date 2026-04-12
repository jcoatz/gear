-- Run this in the Supabase SQL Editor to add bag capacity support

-- Bags table — user's physical bags/packs with capacity limits
CREATE TABLE IF NOT EXISTS public.bags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  brand text,
  model text,
  color text,
  volume_liters numeric,        -- capacity in liters
  max_weight_kg numeric,         -- max load in kg
  own_weight_kg numeric,         -- weight of the bag itself
  bag_type text NOT NULL DEFAULT 'backpack',  -- backpack, daypack, duffel, stuff_sack, dry_bag, hip_pack, other
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bags' AND policyname = 'Users can manage own bags'
  ) THEN
    CREATE POLICY "Users can manage own bags" ON public.bags
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bags_user_id_idx ON public.bags (user_id);

-- Add bag assignment to trip items (nullable — items can be unassigned)
ALTER TABLE public.trip_items
  ADD COLUMN IF NOT EXISTS bag_id uuid REFERENCES public.bags(id) ON DELETE SET NULL;

-- Track which bags are used for a trip
CREATE TABLE IF NOT EXISTS public.trip_bags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  bag_id uuid REFERENCES public.bags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(trip_id, bag_id)
);

ALTER TABLE public.trip_bags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trip_bags' AND policyname = 'Users can manage own trip bags'
  ) THEN
    CREATE POLICY "Users can manage own trip bags" ON public.trip_bags
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.trips WHERE id = trip_bags.trip_id AND user_id = auth.uid())
      );
  END IF;
END $$;
