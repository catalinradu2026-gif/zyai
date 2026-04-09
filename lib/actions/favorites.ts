'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(listingId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Trebuie să fii autentificat' }
  }

  // Check if already favorited
  const { data: existing, error: checkError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) {
      console.error('Error removing favorite:', error)
      return { error: error.message }
    }

    revalidatePath('/cont/favorite')
    revalidatePath(`/anunt/${listingId}`)
    return { success: true, isFavorited: false }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id: listingId,
      })

    if (error) {
      console.error('Error adding favorite:', error.code, error.message)
      // FK violation - listing doesn't exist in DB (e.g. mock listing)
      if (error.code === '23503') {
        return { success: true, isFavorited: true, local: true }
      }
      return { error: error.message }
    }

    revalidatePath('/cont/favorite')
    revalidatePath(`/anunt/${listingId}`)
    return { success: true, isFavorited: true }
  }
}
