import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'not authenticated' })

  const admin = createSupabaseAdmin()
  const { data, error } = await admin
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)

  return Response.json({ user_id: user.id, count: data?.length, rows: data, error: error?.message })
}

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return Response.json({ error: 'listingId required' }, { status: 400 })

    // Verifică user cu clientul normal
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'not_authenticated' }, { status: 401 })

    // Folosește admin client pentru a ocoli RLS
    const admin = createSupabaseAdmin()

    // Check existing
    const { data: existing } = await admin
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (existing) {
      await admin
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
      return Response.json({ isFavorited: false })
    } else {
      const { error } = await admin
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId })

      if (error) {
        console.error('favorites insert error:', error.code, error.message)
        // FK constraint - listing nu există în DB (mock listing)
        if (error.code === '23503') {
          return Response.json({ isFavorited: true, local: true })
        }
        return Response.json({ error: error.message, code: error.code }, { status: 500 })
      }

      return Response.json({ isFavorited: true })
    }
  } catch (err) {
    console.error('favorites route error:', err)
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
