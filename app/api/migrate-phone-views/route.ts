import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createSupabaseAdmin()

  // Testează dacă coloana există
  const { error: testError } = await admin
    .from('listings')
    .select('phone_views')
    .limit(1)

  if (!testError) {
    return NextResponse.json({ ok: true, message: 'phone_views column already exists' })
  }

  return NextResponse.json({
    ok: false,
    message: 'Coloana phone_views lipseste. Ruleaza in Supabase SQL Editor:',
    sql: 'ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS phone_views integer DEFAULT 0;'
  })
}
