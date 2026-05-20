-- Rulează în Supabase SQL Editor

ALTER TABLE asociatie_blaxy ADD COLUMN IF NOT EXISTS saptamana TEXT;
ALTER TABLE asociatie_blaxy ADD COLUMN IF NOT EXISTS sectiune TEXT NOT NULL DEFAULT 'proprietar';

-- Setează toate înregistrările existente ca 'proprietar'
UPDATE asociatie_blaxy SET sectiune = 'proprietar' WHERE sectiune IS NULL OR sectiune = '';
