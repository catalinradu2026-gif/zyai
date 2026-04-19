import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL lipsă' }, { status: 400 })

    // Download image
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.olx.ro/' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return NextResponse.json({ error: 'Nu am putut descărca poza' }, { status: 400 })

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 5000) return NextResponse.json({ error: 'Poza prea mică' }, { status: 400 })

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg'
    const storagePath = `2026/04/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const admin = createSupabaseAdmin()
    const { error } = await admin.storage
      .from('listings')
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: { publicUrl } } = admin.storage.from('listings').getPublicUrl(storagePath)
    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Eroare upload' }, { status: 500 })
  }
}
