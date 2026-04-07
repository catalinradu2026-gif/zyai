import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createSupabaseAdmin()

  // Add metadata column if not exists
  const { error } = await admin.rpc('exec_sql' as any, {
    sql: `ALTER TABLE listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`
  })

  if (error) {
    // Try direct query via postgrest
    const { error: e2 } = await admin
      .from('listings')
      .select('metadata')
      .limit(1)

    if (e2 && e2.message.includes('column')) {
      return NextResponse.json({ error: 'Column metadata does not exist. Add it manually via Supabase SQL editor: ALTER TABLE listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb;' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, message: 'Migration done or column already exists' })
}
