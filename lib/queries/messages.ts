import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function getConversations(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      id, listing_id, sender_id, receiver_id, content, read, created_at,
      listings(id, title, images),
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
    `
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    // Fallback: try without profile join hints
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('messages')
      .select(
        `
        id, listing_id, sender_id, receiver_id, content, read, created_at,
        listings(id, title, images)
      `
      )
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (fallbackError) {
      console.error('Error fetching conversations (fallback):', fallbackError)
      return { data: null, error: fallbackError }
    }

    // Group by listing_id + other user pair, keep latest per thread
    const grouped = new Map()
    fallbackData?.forEach((msg: any) => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      const key = `${msg.listing_id}__${otherUserId}`
      if (!grouped.has(key) || new Date(msg.created_at) > new Date(grouped.get(key).created_at)) {
        grouped.set(key, { ...msg, sender: null, receiver: null })
      }
    })

    return { data: Array.from(grouped.values()), error: null }
  }

  // Group by listing_id + other user pair, keep latest per thread
  const grouped = new Map()
  data?.forEach((msg: any) => {
    const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    const key = `${msg.listing_id}__${otherUserId}`
    if (!grouped.has(key) || new Date(msg.created_at) > new Date(grouped.get(key).created_at)) {
      grouped.set(key, msg)
    }
  })

  return { data: Array.from(grouped.values()), error: null }
}

export async function getMessageThread(listingId: string, userId: string, otherUserId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, listing_id, sender_id, receiver_id, content, read, created_at')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return { data: null, error }
  }

  // Mark messages as read
  if (data && data.length > 0) {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('listing_id', listingId)
      .eq('receiver_id', userId)
      .eq('read', false)
  }

  return { data, error: null }
}

export async function getUnreadCount(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
}
