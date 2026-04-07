'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function signUpWithPhone(phone: string, password: string) {
  const supabase = await createSupabaseServerClient()

  // Verifică dacă telefonul există deja
  const { data: existing } = await supabase
    .from('users_auth')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existing) {
    return { error: 'Acest număr de telefon este deja înregistrat' }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Creează user în auth
    const { error: authError } = await supabase
      .from('users_auth')
      .insert({
        id: userId,
        phone,
        password_hash: passwordHash,
      })

    if (authError) {
      return { error: 'Eroare la înregistrare. Încercați din nou.' }
    }

    // Creează profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        phone,
        full_name: phone,
      })

    if (profileError) {
      await supabase.from('users_auth').delete().eq('id', userId)
      return { error: 'Eroare la înregistrare. Încercați din nou.' }
    }

    // Setează cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', userId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return { success: true, userId }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function signInWithPhone(phone: string, password: string) {
  const supabase = await createSupabaseServerClient()

  try {
    const { data: user, error } = await supabase
      .from('users_auth')
      .select('id, password_hash')
      .eq('phone', phone)
      .single()

    if (error || !user) {
      return { error: 'Telefon sau parolă greșite' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash || '')

    if (!passwordMatch) {
      return { error: 'Telefon sau parolă greșite' }
    }

    // Setează cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    console.log('Login reușit! User ID:', user.id)
    return { success: true, userId: user.id }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
  redirect('/')
}

export async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!data) {
    return null
  }

  return {
    id: data.id,
    phone: data.phone,
    full_name: data.full_name,
  }
}

export async function updateUserPhone(phone: string) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Nu ești autentificat' }
    }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId)

    if (error) {
      return { error: 'Eroare la actualizare. Încercați din nou.' }
    }

    return { success: true }
  } catch (err) {
    return { error: String(err) }
  }
}
