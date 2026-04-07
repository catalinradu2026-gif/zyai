import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'
import HeaderMenu from './HeaderMenu'
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

        {/* Right Side - User + Menu */}
        <div className="flex items-center gap-4">
          {/* User Icon / Login */}
          <HeaderClient />

          {/* Menu Button (•••) */}
          <div className="relative">
            <HeaderMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
