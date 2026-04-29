import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import sharp from 'sharp'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', '']
const FULL_MAX_WIDTH = 900
const FULL_QUALITY = 58
const THUMB_WIDTH = 240
const THUMB_QUALITY = 48

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configurare lipsă' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Niciun fișier primit' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format neacceptat. Folosește JPG sau PNG.' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fișier prea mare (max 10MB)' }, { status: 400 })
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const now = new Date()
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    const fullBuffer = await sharp(inputBuffer)
      .rotate()
      .normalize()
      .sharpen({ sigma: 0.5 })
      .resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY, effort: 6, smartSubsample: true })
      .toBuffer()

    const thumbBuffer = await sharp(inputBuffer)
      .rotate()
      .normalize()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 6, smartSubsample: true })
      .toBuffer()

    const fullPath = `${folder}/${uid}.webp`
    const thumbPath = `${folder}/${uid}_thumb.webp`

    let url: string
    let thumbUrl: string | null = null

    if (isR2Configured()) {
      // Upload pe Cloudflare R2
      url = await uploadToR2(fullBuffer, fullPath, 'image/webp')
      try {
        thumbUrl = await uploadToR2(thumbBuffer, thumbPath, 'image/webp')
      } catch { /* thumbnail opțional */ }
    } else {
      // Fallback: Supabase Storage
      const admin = createClient(supabaseUrl, serviceRoleKey)

      const { error: fullErr } = await admin.storage
        .from('listings')
        .upload(fullPath, fullBuffer, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
      if (fullErr) return NextResponse.json({ error: `Upload eșuat: ${fullErr.message}` }, { status: 500 })

      const { error: thumbErr } = await admin.storage
        .from('listings')
        .upload(thumbPath, thumbBuffer, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })

      const base = `${supabaseUrl}/storage/v1/object/public/listings`
      url = `${base}/${fullPath}`
      thumbUrl = thumbErr ? null : `${base}/${thumbPath}`
    }

    return NextResponse.json({ url, thumbUrl, path: fullPath })
  } catch (err) {
    console.error('Upload handler error:', err)
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 })
  }
}
