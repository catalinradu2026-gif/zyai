import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import sharp from 'sharp'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL lipsă' }, { status: 400 })

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.olx.ro/' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return NextResponse.json({ error: 'Nu am putut descărca poza' }, { status: 400 })

    const rawBuffer = Buffer.from(await res.arrayBuffer())
    if (rawBuffer.byteLength < 5000) return NextResponse.json({ error: 'Poza prea mică' }, { status: 400 })

    // Comprimă la 1000px WebP q70 — înainte era raw, acum comprimăm mereu
    const compressed = await sharp(rawBuffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer()

    const now = new Date()
    const storagePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

    let publicUrl: string

    if (isR2Configured()) {
      publicUrl = await uploadToR2(compressed, storagePath, 'image/webp')
    } else {
      const admin = createSupabaseAdmin()
      const { error } = await admin.storage
        .from('listings')
        .upload(storagePath, compressed, { contentType: 'image/webp', upsert: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const { data: { publicUrl: pu } } = admin.storage.from('listings').getPublicUrl(storagePath)
      publicUrl = pu
    }

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Eroare upload' }, { status: 500 })
  }
}
