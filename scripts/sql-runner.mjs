#!/usr/bin/env node

import { config } from 'dotenv';
import https from 'https';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Creating messages table...\n');

const sql = `
-- Drop and recreate messages table
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX idx_messages_listing ON messages(listing_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Add RLS policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Add metadata to listings if not exists
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

SELECT 'Messages table created successfully!' as result;
`;

const options = {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': \`Bearer \${SERVICE_ROLE_KEY}\`,
    'Content-Type': 'application/json',
  },
};

const reqUrl = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

const req = https.request(reqUrl, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', res.statusCode);
    console.log(data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', err => {
  console.error('Error:', err);
  process.exit(1);
});

req.write(JSON.stringify({ sql }));
req.end();
