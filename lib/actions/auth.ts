'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export async function signUpUser(email: string, password: string, fullName: string) {
  try {
    const admin = createSupabaseAdmin()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) return { error: error.message }

    // Creează profilul imediat
    if (data.user) {
      await admin.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: '',
        city: '',
      })
    }

    return { success: true }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getUser() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone, city')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email || '',
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
    }
  } catch {
    return null
  }
}

export async function getEmailByPhone(phone: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    if (!profile) return { error: 'Numărul de telefon nu a fost găsit' }

    const admin = createSupabaseAdmin()
    const { data: { user }, error } = await admin.auth.admin.getUserById(profile.id)

    if (error || !user?.email) return { error: 'Cont negăsit pentru acest număr' }

    return { email: user.email }
  } catch (err) {
    return { error: 'Eroare la căutare' }
  }
}

export async function updateEmail(newEmail: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Nu ești autentificat' }

    const admin = createSupabaseAdmin()
    const { error } = await admin.auth.admin.updateUserById(user.id, { email: newEmail, email_confirm: true })
    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Nu ești autentificat' }

    // Verifică parola curentă
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })
    if (signInError) return { error: 'Parola curentă este greșită' }

    const admin = createSupabaseAdmin()
    const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword })
    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function updateProfile(data: {
  full_name?: string
  phone?: string
  city?: string
}) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Nu ești autentificat' }

    const admin = createSupabaseAdmin()

    // upsert — actualizează dacă există, creează dacă nu există
    const metaName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Utilizator'

    const payload: Record<string, any> = { id: user.id }
    if (data.full_name !== undefined) payload.full_name = data.full_name
    else payload.full_name = metaName
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.city !== undefined) payload.city = data.city

    const { error } = await admin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error('[updateProfile] error:', error)
      return { error: 'Eroare la salvare: ' + error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('[updateProfile] unexpected:', err)
    return { error: String(err) }
  }
}
