import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'not authenticated' })

  // Test insert cu un UUID fake
  const testId = '00000000-0000-0000-0000-000000000000'
  const { error: insertError } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, listing_id: testId })

  // Șterge imediat testul
  await supabase.from('favorites').delete()
    .eq('user_id', user.id).eq('listing_id', testId)

  // Verifică dacă tabelul există și ce coloane are
  const { data: cols, error: colErr } = await supabase
    .from('favorites')
    .select('*')
    .limit(1)

  return Response.json({
    user_id: user.id,
    table_accessible: !colErr,
    table_error: colErr?.message,
    insert_error: insertError ? { code: insertError.code, message: insertError.message } : null,
    sample_row: cols?.[0] ?? null,
  })
}
