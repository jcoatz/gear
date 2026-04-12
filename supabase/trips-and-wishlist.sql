-- Run this in the Supabase SQL Editor to add trips + wishlist support

-- Wishlist flag on gear items
ALTER TABLE public.gear_items ADD COLUMN IF NOT EXISTS wishlist boolean NOT NULL DEFAULT false;

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  target_weight_kg numeric,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can manage own trips'
  ) THEN
    CREATE POLICY "Users can manage own trips" ON public.trips
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trip items (junction table)
CREATE TABLE IF NOT EXISTS public.trip_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  gear_item_id uuid REFERENCES public.gear_items(id) ON DELETE CASCADE NOT NULL,
  packed boolean DEFAULT false NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(trip_id, gear_item_id)
);

ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trip_items' AND policyname = 'Users can manage own trip items'
  ) THEN
    CREATE POLICY "Users can manage own trip items" ON public.trip_items
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.trips WHERE id = trip_items.trip_id AND user_id = auth.uid())
      );
  END IF;
END $$;
