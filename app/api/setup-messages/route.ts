import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // Check if messages table exists
    const { error: checkError } = await admin
      .from('messages')
      .select('id')
      .limit(1)

    if (checkError && checkError.message.includes('relation')) {
      // Table doesn't exist - need manual setup
      return NextResponse.json(
        {
          error: 'Messages table missing. Must create manually in Supabase.',
          instruction: 'Use Supabase Dashboard → SQL Editor and run the SQL provided'
        },
        { status: 400 }
      )
    }

    // Table exists!
    return NextResponse.json({
      success: true,
      messagesTable: 'exists',
      message: 'Messages table is ready! You can now send messages.'
    })
  } catch (err) {
    console.error('Setup check error:', err)
    return NextResponse.json(
      {
        error: `Error: ${String(err)}`
      },
      { status: 500 }
    )
  }
}
