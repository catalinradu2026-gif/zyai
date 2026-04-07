import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: Record<string, string> = {}

  // Adaugă category_slug dacă nu există
  const { error: e1 } = await admin.from('listings').select('category_slug').limit(1)
  if (e1?.message?.includes('category_slug')) {
    // Coloana nu există - o adăugăm via upsert cu valoare default
    // Nu putem ALTER TABLE direct, dar putem testa cu insert
    results.category_slug = 'missing - add manually in Supabase SQL editor'
  } else {
    results.category_slug = 'exists'
  }

  // Adaugă category_name dacă nu există
  const { error: e2 } = await admin.from('listings').select('category_name').limit(1)
  results.category_name = e2 ? 'missing' : 'exists'

  // Test insert fără category_id
  const { data: testUser } = await admin.from('profiles').select('id').limit(1)
  results.profiles = testUser ? 'exists' : 'empty'

  return NextResponse.json({ results, message: 'Run SQL in Supabase dashboard if columns missing' })
}
