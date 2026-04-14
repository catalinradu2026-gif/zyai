import { getUser } from '@/lib/actions/auth'
import { getListing } from '@/lib/queries/listings'
import { notFound } from 'next/navigation'
import ListingForm from '@/components/listings/ListingForm'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data: listing } = await getListing(id)
  return {
    title: listing ? `Editează: ${listing.title}` : 'Editează anunț',
  }
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()
  const { data: listing } = await getListing(id)

  if (!listing || !user || user.id !== listing.user_id) {
    notFound()
  }

  return <ListingForm initialData={listing} />
}
