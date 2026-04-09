import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: Record<string, string> = {}

  try {
    // 1. Check messages table
    console.log('Checking messages table...')
    const { data: messages, error: messagesError } = await admin
      .from('messages')
      .select('id')
      .limit(1)

    if (messagesError && messagesError.message.includes('relation')) {
      results.messages = 'TABLE_MISSING - needs SQL'
      console.log('Messages table missing')
    } else {
      results.messages = 'exists'
      console.log('Messages table exists')
    }
  } catch (err) {
    results.messages = 'error checking'
  }

  try {
    // 2. Check/add metadata column
    const { error: metadataError } = await admin
      .from('listings')
      .select('metadata')
      .limit(1)

    results.metadata_column = metadataError?.message?.includes('metadata') ? 'missing' : 'exists'
  } catch (err) {
    results.metadata_column = 'error'
  }

  return NextResponse.json({
    results,
    message: 'If messages table missing, run SQL from SETUP_MESSAGES_TABLE.sql in Supabase editor',
    sql_file: 'See /SETUP_MESSAGES_TABLE.sql in project root'
  })
}
