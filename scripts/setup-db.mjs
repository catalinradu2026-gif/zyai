#!/usr/bin/env node

import https from 'https';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

    const options = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function setupDB() {
  console.log('🔧 Setup Database...\n');

  const sqls = [
    // Create messages table
    `
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
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );
    `,
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages(listing_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);`,
    // Add metadata to listings
    `ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`,
  ];

  for (const sql of sqls) {
    const label = sql.trim().substring(0, 50).replace(/\n/g, ' ') + '...';
    try {
      console.log(`⏳ ${label}`);
      const result = await executeSQL(sql);

      if (result.status === 200 || result.status === 201) {
        console.log(`   ✅ OK\n`);
      } else if (result.status === 409 || result.body?.message?.includes('already')) {
        console.log(`   ℹ️  Already exists\n`);
      } else {
        console.log(`   ⚠️  Status ${result.status}: ${JSON.stringify(result.body)}\n`);
      }
    } catch (err) {
      console.log(`   ❌ ${err.message}\n`);
    }
  }

  console.log('✨ Done!\n');
}

setupDB();
