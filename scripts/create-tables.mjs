#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: 'public' },
});

async function createTables() {
  console.log('🔧 Creez tabelele lipsă...\n');

  try {
    // 1. Check if messages table exists
    console.log('1️⃣  Verific tabelul messages...');
    const { data: existingMessages, error: checkError } = await admin
      .from('messages')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('   ✅ Tabelul messages există deja');
    } else if (checkError.message.includes('relation') || checkError.message.includes('table')) {
      console.log('   ⚠️  Tabelul messages nu există, creez...');

      // Create via SQL
      const { data, error } = await admin.query(`
        CREATE TABLE IF NOT EXISTS public.messages (
          id uuid NOT NULL DEFAULT gen_random_uuid(),
          listing_id uuid NOT NULL,
          sender_id uuid NOT NULL,
          receiver_id uuid NOT NULL,
          content text NOT NULL,
          read boolean NOT NULL DEFAULT false,
          created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
          PRIMARY KEY (id),
          CONSTRAINT fk_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
          CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
          CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
        CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
      `);

      if (error) {
        console.error('   ❌ Eroare:', error);
      } else {
        console.log('   ✅ Tabelul messages creat cu succes');
      }
    }

    // 2. Check/add metadata column to listings
    console.log('\n2️⃣  Verific coloane listings...');
    const { data: listings, error: listingsError } = await admin
      .from('listings')
      .select('metadata')
      .limit(1);

    if (!listingsError) {
      console.log('   ✅ Coloana metadata există');
    } else {
      console.log('   ⚠️  Adaug metadata column...');
      const { error: addError } = await admin.query(`
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
      `);

      if (addError) {
        console.log('   ⚠️  Warning:', addError.message);
      } else {
        console.log('   ✅ Metadata column adăugat');
      }
    }

    console.log('\n✨ Tabelele sunt gata!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    process.exit(1);
  }
}

createTables();
