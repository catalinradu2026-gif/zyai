-- ============================================================
-- zyAI.ro — Enable RLS Security
-- Rulează asta în Supabase Dashboard > SQL Editor
-- SAFE: toate operațiunile din app folosesc service_role care
--       bypass-uiește RLS, deci nu strici nimic în aplicație
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. LISTINGS — piesa centrală, trebuie protejată
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Oricine poate vedea anunțurile active (marketplace public)
CREATE POLICY "Public can view active listings" ON public.listings
  FOR SELECT
  USING (status = 'activ');

-- Proprietarul vede și anunțurile proprii indiferent de status
CREATE POLICY "Owner can view own listings" ON public.listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Utilizatorii autentificați pot crea anunțuri
CREATE POLICY "Authenticated users can insert listings" ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doar proprietarul poate edita propriul anunț
CREATE POLICY "Owner can update own listings" ON public.listings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Doar proprietarul poate șterge propriul anunț
CREATE POLICY "Owner can delete own listings" ON public.listings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 2. PROFILES — date utilizatori
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profilurile sunt publice (cumpărătorii văd datele vânzătorului)
CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT
  USING (true);

-- Utilizatorul poate crea propriul profil
CREATE POLICY "User can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Utilizatorul poate edita doar propriul profil
CREATE POLICY "User can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Utilizatorul poate șterge propriul profil
CREATE POLICY "User can delete own profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 3. CATEGORIES — date statice, read-only pentru toți
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 4. MESSAGES — deja configurat, re-verificare
-- ────────────────────────────────────────────────────────────
-- Dacă nu ai rulat SETUP_MESSAGES_TABLE.sql:
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- (politicile sunt în SETUP_MESSAGES_TABLE.sql)

-- ────────────────────────────────────────────────────────────
-- 5. FAVORITES — deja configurat, re-verificare
-- ────────────────────────────────────────────────────────────
-- Dacă nu ai rulat SETUP_FAVORITES_TABLE.sql:
-- ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
-- (politicile sunt în SETUP_FAVORITES_TABLE.sql)

-- ────────────────────────────────────────────────────────────
-- 6. BUYER ALERTS (dacă există tabela)
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buyer_alerts') THEN
    EXECUTE 'ALTER TABLE public.buyer_alerts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY IF NOT EXISTS "User can manage own alerts" ON public.buyer_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 7. Verificare finală — vezi ce tabele au RLS activ
-- ────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
