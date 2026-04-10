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
      <nav className="fixed top-16 left-0 right-0 z-40 overflow-x-auto backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(8,11,20,0.9)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace/${cat.slug}`}
              className="py-3 px-3 text-sm font-medium whitespace-nowrap transition-all hover:scale-105"
              style={{ color: 'var(--text-secondary)' }}
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
