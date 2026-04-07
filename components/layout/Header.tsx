import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { signOut } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const user = await getUser()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          zyAI
        </Link>

        {/* Navigation - Minimal */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Home
          </Link>
          <Link href="/marketplace/joburi" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Anunțuri
          </Link>

          {user ? (
            <>
              <Link
                href="/anunt/nou"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
              >
                ➕ Postează
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/cont/anunturi" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Cont
                </Link>
                <form action={signOut}>
                  <button type="submit" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Iesire
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
