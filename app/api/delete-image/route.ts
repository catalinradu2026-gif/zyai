import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isR2Configured, deleteFromR2 } from '@/lib/r2'

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

    const { imageUrl } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'Image URL required' }, { status: 400 })

    // R2
    if (isR2Configured() && process.env.R2_PUBLIC_URL && imageUrl.startsWith(process.env.R2_PUBLIC_URL)) {
      await deleteFromR2(imageUrl)
      return NextResponse.json({ success: true })
    }

    // Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Configuration error' }, { status: 500 })

    const urlParts = imageUrl.split('/storage/v1/object/public/listings/')
    if (urlParts.length !== 2) return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await admin.storage.from('listings').remove([urlParts[1]])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete handler error:', err)
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 })
  }
}
