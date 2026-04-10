import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'
import MessagesBadge from './MessagesBadge'

export default async function Header() {
  const user = await getUser()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo - Gradient Premium */}
        <Link
          href="/"
          className="text-2xl font-bold whitespace-nowrap flex items-center gap-2 group"
        >
          <span className="gradient-main-text text-2xl font-black">zyAI</span>
          <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">AI</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          {user && <MessagesBadge />}

          <Link
            href="/anunt/nou"
            className="flex items-center gap-1.5 px-4 py-2 font-semibold whitespace-nowrap transition-all duration-200 transform hover:scale-105 active:scale-95 gradient-main text-white text-sm"
            style={{ borderRadius: '100px', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Postează</span>
          </Link>

          {/* Cont dropdown */}
          <HeaderClient />
        </div>
      </div>
    </header>
  )
}
