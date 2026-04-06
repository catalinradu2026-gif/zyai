import { getUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/listings/ListingForm'

export const metadata = {
  title: 'Postează anunț - zyAI',
}

export default async function PostListingPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login?next=/anunt/nou')
  }

  return (
    <main className="pt-32 pb-20 px-4 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center">Postează un anunț</h1>
        <p className="text-center text-gray-600 mt-2">Completează formularul pentru a-ți posta anunțul</p>
      </div>
      <ListingForm />
    </main>
  )
}
