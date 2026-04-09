import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createSupabaseAdmin()

  // Ultimul anunț postat
  const { data: latest, error: e1 } = await admin
    .from('listings')
    .select('id, title, category_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  // Coloane disponibile
  const { data: cols, error: e2 } = await admin
    .from('listings')
    .select('id, metadata')
    .limit(1)

  return NextResponse.json({
    latest_listings: latest,
    error: e1?.message,
    metadata_accessible: !e2,
    metadata_error: e2?.message,
  })
}
