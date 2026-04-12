-- Run this in Supabase SQL Editor
-- (Run AFTER the trips and gear_items tables exist)

CREATE TABLE public.pack_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.pack_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates"
  ON public.pack_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.pack_template_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.pack_templates(id) ON DELETE CASCADE NOT NULL,
  gear_item_id integer REFERENCES public.gear_items(id) ON DELETE CASCADE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.pack_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own template items"
  ON public.pack_template_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pack_templates
      WHERE id = pack_template_items.template_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pack_templates
      WHERE id = pack_template_items.template_id
        AND user_id = auth.uid()
    )
  );
