-- Run this in Supabase Dashboard > SQL Editor
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS phone_views integer DEFAULT 0;
