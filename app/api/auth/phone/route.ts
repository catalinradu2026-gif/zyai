import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server not configured properly' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { phone, fullName, password, mode } = await req.json()

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Completează telefon și parolă!' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parola trebuie să aibă cel puțin 6 caractere!' },
        { status: 400 }
      )
    }

    // Verifică dacă user există
    const { data: existing, error: queryError } = await supabase
      .from('users_auth')
      .select('id, password_hash')
      .eq('phone', phone)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = no rows found (ok for new users)
      console.error('Query error:', queryError)
    }

    if (mode === 'register') {
      if (existing) {
        return NextResponse.json(
          { error: 'Acest număr de telefon este deja înregistrat!' },
          { status: 400 }
        )
      }

      if (!fullName) {
        return NextResponse.json(
          { error: 'Completează numele complet!' },
          { status: 400 }
        )
      }

      // Creează user nou
      const userId = uuidv4()
      const passwordHash = await bcrypt.hash(password, 10)

      const { error: authError } = await supabase
        .from('users_auth')
        .insert({
          id: userId,
          phone,
          password_hash: passwordHash,
        })

      if (authError) {
        console.error('Auth insert error:', authError)
        return NextResponse.json(
          { error: 'Eroare la înregistrare. Încercați din nou.' },
          { status: 500 }
        )
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          phone,
          full_name: fullName,
        })

      if (profileError) {
        // Revert auth entry
        await supabase.from('users_auth').delete().eq('id', userId)
        console.error('Profile insert error:', profileError)
        return NextResponse.json(
          { error: 'Eroare la înregistrare. Încercați din nou.' },
          { status: 500 }
        )
      }

      const response = NextResponse.json({
        userId,
        phone,
        fullName,
      })

      response.cookies.set('user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return response
    } else {
      // Login mode
      if (!existing) {
        return NextResponse.json(
          { error: 'Telefon sau parolă greșite!' },
          { status: 401 }
        )
      }

      const passwordMatch = await bcrypt.compare(password, existing.password_hash || '')

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Telefon sau parolă greșite!' },
          { status: 401 }
        )
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', existing.id)
        .single()

      const response = NextResponse.json({
        userId: existing.id,
        phone,
        fullName: profile?.full_name || phone,
      })

      response.cookies.set('user_id', existing.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return response
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
