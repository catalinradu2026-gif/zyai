'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export async function signUpUser(email: string, password: string, fullName: string) {
  try {
    const admin = createSupabaseAdmin()
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) return { error: error.message }
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

export async function updateProfile(data: {
  full_name?: string
  phone?: string
  city?: string
}) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Nu ești autentificat' }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) return { error: 'Eroare la salvare. Încearcă din nou.' }
    return { success: true }
  } catch (err) {
    return { error: String(err) }
  }
}
