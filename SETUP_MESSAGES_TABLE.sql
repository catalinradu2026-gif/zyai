-- ============================================
-- Setup Messages Table for zyai.ro
-- Rulează asta în Supabase SQL Editor
-- ============================================

-- 1. Create messages table
-- IMPORTANT: sender_id și receiver_id referă public.profiles (nu auth.users)
-- pentru ca Supabase PostgREST să poată face JOIN-uri în queries
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 2000),
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view their own messages (sender sau receiver)
CREATE POLICY IF NOT EXISTS "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages (sender_id trebuie să fie userul curent)
CREATE POLICY IF NOT EXISTS "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Only receiver can mark messages as read
CREATE POLICY IF NOT EXISTS "Users can update read status" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- 5. Add metadata column to listings if not exists
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- FIX pentru tabele existente cu sender_id -> auth.users
-- Dacă tabela messages există deja cu FK spre auth.users,
-- rulează asta pentru a schimba FK-urile spre profiles:
-- ============================================
-- ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
-- ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
-- ALTER TABLE public.messages
--   ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
--   ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Check if everything worked
SELECT 'Tables setup complete!' as status;
SELECT COUNT(*) as messages_count FROM public.messages;
