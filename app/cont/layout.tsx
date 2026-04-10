import { getUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login?next=/cont/anunturi')
  }

  return (
    <main className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Contul Meu</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="rounded-lg p-6 h-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="space-y-1">
              <Link href="/cont/anunturi" className="block px-4 py-2 rounded-lg transition font-medium" style={{ color: 'var(--text-primary)' }}>
                📝 Anunțurile mele
              </Link>
              <Link href="/cont/favorite" className="block px-4 py-2 rounded-lg transition font-medium" style={{ color: 'var(--text-primary)' }}>
                ❤️ Favorite
              </Link>
              <Link href="/cont/mesaje" className="block px-4 py-2 rounded-lg transition font-medium" style={{ color: 'var(--text-primary)' }}>
                💬 Mesaje
              </Link>
              <Link href="/cont/profil" className="block px-4 py-2 rounded-lg transition font-medium" style={{ color: 'var(--text-primary)' }}>
                👤 Profil
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </main>
  )
}
