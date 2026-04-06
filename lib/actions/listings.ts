'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: {
  title: string
  description: string
  categoryId: number
  city: string
  county: string
  price?: number
  priceType: string
  currency: string
  images: string[]
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Trebuie să fii autentificat' }
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      category_id: formData.categoryId,
      city: formData.city,
      county: formData.county,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
      status: 'activ',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating listing:', error)
    return { error: error.message }
  }

  revalidatePath('/marketplace')
  redirect(`/anunt/${data.id}`)
}

export async function updateListing(
  id: string,
  formData: {
    title: string
    description: string
    city: string
    county: string
    price?: number
    priceType: string
    currency: string
    images: string[]
  }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Neautorizat' }
  }

  const { error } = await supabase
    .from('listings')
    .update({
      title: formData.title,
      description: formData.description,
      city: formData.city,
      county: formData.county,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating listing:', error)
    return { error: error.message }
  }

  revalidatePath(`/anunt/${id}`)
  revalidatePath('/cont/anunturi')
  redirect(`/anunt/${id}`)
}

export async function deleteListing(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Neautorizat' }
  }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting listing:', error)
    return { error: error.message }
  }

  revalidatePath('/cont/anunturi')
  redirect('/cont/anunturi')
}
