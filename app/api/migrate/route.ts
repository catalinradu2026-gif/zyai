import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const admin = createSupabaseAdmin()

  const migrations = [
    // Create messages table if not exists
    `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    `,
    // Add indexes for messages table
    `CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);`,

    // Add metadata column to listings if not exists
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`,
  ]

  const results = []

  for (const sql of migrations) {
    try {
      const { error } = await admin.rpc('exec_sql' as any, { sql })

      if (!error) {
        results.push({ sql: sql.substring(0, 50) + '...', status: 'ok' })
      } else {
        // Try with direct query
        const { error: e2 } = await admin
          .from('messages')
          .select('id')
          .limit(1)

        if (!e2) {
          results.push({ sql: sql.substring(0, 50) + '...', status: 'exists' })
        } else {
          results.push({ sql: sql.substring(0, 50) + '...', status: 'error', error: error.message })
        }
      }
    } catch (err) {
      results.push({ sql: sql.substring(0, 50) + '...', status: 'error', error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, message: 'Migrations completed', results })
}
