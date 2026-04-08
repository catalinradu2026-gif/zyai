# Setup Messages Table

Eroare: `Could not find the table public.messages in the scheme cache`

## Soluție rapidă (2 minute)

### 1. Mergi la Supabase Dashboard
- https://app.supabase.com
- Select project `vqrayicxvxltbymvgbzh`
- SQL Editor → New Query

### 2. Copie și execută SQL-ul:

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Metadata column
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
```

### 3. Apasă "Run" ✓

Gata! Mesajele vor merge acum. 🎉

---

## Detalii

- Tabelul messages conectează messages → listings → users
- Indexes pentru performance pe query-uri frecvente
- Foreign keys cu ON DELETE CASCADE (pt cleanup)
- Timestamps automate (created_at, updated_at)

## Teste după setup

```bash
# Merge pe app
npm run dev
# Visit http://localhost:3006/anunt/[id] → trimite mesaj → ar trebui să meargă
```
