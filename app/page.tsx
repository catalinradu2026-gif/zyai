import Link from 'next/link'
import CategoriesBrowser from '@/components/CategoriesBrowser'

export default function Home() {
  return (
    <main className="min-h-screen bg-white pt-16 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Slogan */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
            Spune ce vrei.<br />
            <span className="text-blue-600">zyAI găsește pentru tine.</span>
          </h1>
        </div>

        {/* Helper Text */}
        <div className="text-center mb-12">
          <p className="text-gray-500 text-sm">
            🔍 Caută cu AI în header
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
