-- ============================================
-- Setup Favorites Table pentru zyai.ro
-- Rulează asta în Supabase SQL Editor
-- ============================================

-- 1. Creare tabel favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, listing_id)
);

-- 2. Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing ON public.favorites(user_id, listing_id);

-- 3. Activare RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. Politici RLS

-- SELECT: utilizatorii văd doar propriile favorite
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: utilizatorii pot adăuga propriile favorite
CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: utilizatorii pot șterge propriile favorite
CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Verificare
SELECT 'Favorites table setup complete!' AS status;
SELECT COUNT(*) AS favorites_count FROM public.favorites;
