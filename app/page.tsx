import Link from 'next/link'
import CategoriesBrowser from '@/components/CategoriesBrowser'

export default function Home() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Text */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm">
            ↑ Caută cu AI în header sau explorează mai jos
          </p>
        </div>

        {/* Categories Browser - Smart Container */}
        <CategoriesBrowser />

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link
            href="/anunt/nou"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Postează anunț gratuit
          </Link>
        </div>
      </div>
    </main>
  )
}
