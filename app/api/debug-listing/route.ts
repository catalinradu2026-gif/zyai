import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createSupabaseAdmin()

  // Verifică primele 5 anunțuri cu category_id=3 (auto)
  const { data, error } = await admin
    .from('listings')
    .select('id, title, category_id, metadata')
    .eq('category_id', 3)
    .limit(5)

  // Verifică dacă coloana metadata există
  const { data: allCols, error: colErr } = await admin
    .from('listings')
    .select('metadata')
    .limit(1)

  return NextResponse.json({
    auto_listings: data,
    error: error?.message,
    metadata_col_exists: !colErr,
    metadata_col_error: colErr?.message,
  })
}
