import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import HeaderClient from './HeaderClient'
import HeaderSearchBar from './HeaderSearchBar'

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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Logo - Gradient Premium */}
        <Link
          href="/"
          className="text-2xl font-bold whitespace-nowrap flex items-center gap-2 group"
        >
          <span className="gradient-main-text text-2xl font-black">zyAI</span>
          <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">AI</span>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md hidden sm:block">
          <HeaderSearchBar />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link
                href="/cont/mesaje"
                className="p-2.5 rounded-lg transition-all duration-200 hover:glow-purple"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
                title="Mesaje"
              >
                💬
              </Link>
            </>
          )}

          <Link
            href="/anunt/nou"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 transform hover:scale-105 gradient-main text-white text-sm shadow-lg hover:shadow-xl"
            style={{ boxShadow: 'var(--glow-purple)' }}
          >
            <span>⚡</span> Postează
          </Link>

          {/* Mobile Search Icon */}
          <button
            className="sm:hidden p-2.5 rounded-lg transition-all duration-200"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            🔍
          </button>

          {/* Cont dropdown */}
          <HeaderClient />
        </div>
      </div>
    </header>
  )
}
