-- Rulează asta o singură dată în Supabase SQL Editor

CREATE TABLE IF NOT EXISTS asociatie_blaxy (
  id BIGSERIAL PRIMARY KEY,
  nume TEXT NOT NULL,
  prenume TEXT NOT NULL,
  studiouri INTEGER NOT NULL DEFAULT 1 CHECK (studiouri >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fără RLS — pagina e internă, fără autentificare
ALTER TABLE asociatie_blaxy DISABLE ROW LEVEL SECURITY;
