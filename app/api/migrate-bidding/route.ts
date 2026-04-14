import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// GET /api/migrate-bidding — rulează o singură dată pentru a crea tabelul bids
export async function GET() {
  const admin = createSupabaseAdmin()

  const migrations = [
    // Bidding columns on listings
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS bidding_end_time timestamptz;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS current_highest_bid numeric DEFAULT 0;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS bidding_winner_id uuid;`,

    // Bids table
    `CREATE TABLE IF NOT EXISTS bids (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      user_id uuid NOT NULL,
      user_name text,
      amount numeric NOT NULL,
      created_at timestamptz DEFAULT now()
    );`,

    // RLS on bids
    `ALTER TABLE bids ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Anyone can read bids" ON bids;`,
    `CREATE POLICY "Anyone can read bids" ON bids FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "Auth users insert bids" ON bids;`,
    `CREATE POLICY "Auth users insert bids" ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);`,

    // Index
    `CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);`,
  ]

  const results = []
  for (const sql of migrations) {
    try {
      const { error } = await admin.rpc('exec_sql' as any, { sql })
      results.push({ sql: sql.substring(0, 60) + '...', status: error ? 'rpc_error' : 'ok', error: error?.message })
    } catch (err) {
      results.push({ sql: sql.substring(0, 60) + '...', status: 'exception', error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, results })
}
