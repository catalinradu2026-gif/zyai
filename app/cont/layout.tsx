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
    <main className="pt-24 pb-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contul Meu</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg p-6 h-fit shadow-sm">
            <div className="space-y-2">
              <Link
                href="/cont/anunturi"
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
              >
                📝 Anunțurile mele
              </Link>
              <Link
                href="/cont/favorite"
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
              >
                ❤️ Favorite
              </Link>
              <Link
                href="/cont/mesaje"
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
              >
                💬 Mesaje
              </Link>
              <Link
                href="/cont/profil"
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
              >
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
