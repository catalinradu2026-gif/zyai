import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return Response.json({ error: 'listingId required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createSupabaseAdmin()

    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, metadata')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) {
      return Response.json({ error: 'Not allowed' }, { status: 403 })
    }

    // Scoatem sold_at din metadata și punem status activ
    const currentMeta = (listing as any).metadata || {}
    const { sold_at, ...restMeta } = currentMeta

    const { error } = await admin
      .from('listings')
      .update({ status: 'activ', metadata: restMeta })
      .eq('id', listingId)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ ok: true, status: 'activ' })
  } catch (err) {
    console.error('[reactivate]', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
