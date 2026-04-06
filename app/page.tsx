import Link from 'next/link'
import { getAllCategories } from '@/lib/constants/categories'

export default function Home() {
  const categories = getAllCategories()

  return (
    <main className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="px-4 py-16 bg-gradient-to-b from-blue-50 to-white text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Bine venit pe zyAI</h1>
          <p className="text-xl text-gray-600 mb-8">
            Platforma de anunțuri alimentată de AI. Găsește joburi, imobiliare, auto, sau servicii în România.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-12">
            <input
              type="text"
              placeholder="Caută anunțuri..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              🔍 Caută
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Categorii</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/marketplace/${category.slug}`}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition text-center"
            >
              <div className="text-5xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
              <p className="text-gray-500 text-sm mt-2">Explorează anunțuri</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-blue-50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Vrei să postezi un anunț?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Conectează-te și postează-ți anunțul în doar câteva minute.
          </p>
          <Link
            href="/(auth)/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg"
          >
            Postează Acum →
          </Link>
        </div>
      </section>
    </main>
  )
}
