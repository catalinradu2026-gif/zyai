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
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <ListingForm />
    </main>
  )
}
