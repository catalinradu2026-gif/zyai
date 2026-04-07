'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from './auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function createListing(formData: {
  title: string
  description: string
  categorySlug: string
  categoryName: string
  city: string
  county?: string
  price?: number
  priceType: string
  currency: string
  images: string[]
}) {
  const user = await getUser()
  if (!user?.id) return { error: 'Trebuie să fii autentificat' }

  const admin = createSupabaseAdmin()

  const { data, error } = await admin
    .from('listings')
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      category_slug: formData.categorySlug,
      category_name: formData.categoryName,
      city: formData.city,
      county: formData.county || formData.city,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
      status: 'activ',
    })
    .select('id')
    .single()

  if (error) {
    console.error('createListing error:', error)
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
    county?: string
    price?: number
    priceType: string
    currency: string
    images: string[]
  }
) {
  const user = await getUser()
  if (!user) return { error: 'Neautorizat' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('listings')
    .update({
      title: formData.title,
      description: formData.description,
      city: formData.city,
      county: formData.county || formData.city,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/anunt/${id}`)
  revalidatePath('/cont/anunturi')
  redirect(`/anunt/${id}`)
}

export async function deleteListing(id: string) {
  const user = await getUser()
  if (!user) return { error: 'Neautorizat' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/cont/anunturi')
  redirect('/cont/anunturi')
}
