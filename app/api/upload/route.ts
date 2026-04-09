import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const maxDuration = 60 // 60s timeout per request

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: NextRequest) {
  try {
    // Verificare autentificare
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier primit' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fișier prea mare (max 5MB)' }, { status: 400 })
    }

    // Validate file type — extensia din content-type validat, nu din filename
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'Format neacceptat (JPEG, PNG, WebP, GIF)' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `${timestamp}-${random}.${ext}`

    const buffer = await file.arrayBuffer()
    const { data, error } = await admin.storage
      .from('listings')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    if (!data?.path) {
      console.error('No path returned from upload')
      return NextResponse.json({ error: 'Upload successful but no path returned' }, { status: 500 })
    }

    // Generate public URL correctly
    const url = `${supabaseUrl}/storage/v1/object/public/listings/${data.path}`

    return NextResponse.json({ url, path: data.path })
  } catch (err) {
    console.error('Upload handler error:', err)
    console.error('Upload handler error:', err)
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 })
  }
}
