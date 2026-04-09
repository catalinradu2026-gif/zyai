'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function sendMessage(
  listingId: string,
  receiverId: string,
  content: string
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Trebuie să fii autentificat' }
  }

  if (!listingId || !UUID_REGEX.test(listingId)) {
    return { error: 'ID anunț invalid' }
  }

  if (!receiverId || !UUID_REGEX.test(receiverId)) {
    return { error: 'ID destinatar invalid' }
  }

  if (receiverId === user.id) {
    return { error: 'Nu poți trimite mesaj ție însuți' }
  }

  if (!content.trim()) {
    return { error: 'Mesajul nu poate fi gol' }
  }

  if (content.trim().length > 2000) {
    return { error: 'Mesajul nu poate depăși 2000 de caractere' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      read: false,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: error.message }
  }

  revalidatePath(`/cont/mesaje/${listingId}`)
  return { success: true, data }
}
