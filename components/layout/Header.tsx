import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { signOut } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const user = await getUser()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          zyAI
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Acasă
          </Link>
          <Link href="/marketplace/joburi" className="text-gray-700 hover:text-gray-900">
            Anunțuri
          </Link>

          {user ? (
            <>
              <Link
                href="/anunt/nou"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ➕ Postează
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.phone}</span>
                <Link href="/cont/anunturi" className="text-gray-700 hover:text-gray-900">
                  Cont
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Deconectare
                  </button>
                </form>
              </div>
            </>
          ) : (
            <HeaderClient />
          )}
        </div>
      </div>
    </header>
  )
}
