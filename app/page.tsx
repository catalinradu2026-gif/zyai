import Link from 'next/link'
import { getAllCategories } from '@/lib/constants/categories'

export default function Home() {
  const categories = getAllCategories()

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Text */}
        <div className="text-center mb-16">
          <p className="text-gray-600 text-sm mb-4">
            ↑ Caută cu AI în header, sau alege o categorie
          </p>
        </div>

        {/* 4 Categories - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/marketplace/${category.slug}`}
              className="group"
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {category.name}
                </h2>

                {/* Hover Arrow */}
                <div className="mt-4 text-gray-400 group-hover:text-blue-600 transition opacity-0 group-hover:opacity-100">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

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
