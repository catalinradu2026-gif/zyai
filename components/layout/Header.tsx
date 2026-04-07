import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'
import HeaderSearchBar from './HeaderSearchBar'

export default async function Header() {
  const user = await getUser()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent whitespace-nowrap">
          zyAI
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md">
          <HeaderSearchBar />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link href="/cont/favorite" className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition" title="Favorite">
                ❤️
              </Link>
              <Link href="/cont/mesaje" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition" title="Mesaje">
                💬
              </Link>
            </>
          )}

          <Link
            href="/anunt/nou"
            className="hidden sm:flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
          >
            + Postează
          </Link>

          {/* Cont dropdown */}
          <HeaderClient />

        </div>
      </div>
    </header>
  )
}
