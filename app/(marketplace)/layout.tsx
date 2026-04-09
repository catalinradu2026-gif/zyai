import { getAllCategories } from '@/lib/constants/categories'
import Link from 'next/link'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = getAllCategories()

  return (
    <>
      {/* Category Navigation */}
      <nav className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-6" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace/${cat.slug}`}
              className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap transition"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-32">{children}</div>
    </>
  )
}
