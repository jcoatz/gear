-- Run this in Supabase SQL Editor

CREATE TABLE public.user_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_slug text NOT NULL,
  skill_level text NOT NULL DEFAULT 'want_to_try',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_slug)
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activities"
  ON public.user_activities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
