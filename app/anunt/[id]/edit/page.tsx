import { getUser } from '@/lib/actions/auth'
import { getListing } from '@/lib/queries/listings'
import { notFound } from 'next/navigation'
import EditListingForm from '@/components/listings/EditListingForm'

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

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Editează anunț</h1>
        <p className="text-gray-600 mb-8">Actualizează detaliile anunțului tău</p>
        <EditListingForm listing={listing} />
      </div>
    </main>
  )
}
