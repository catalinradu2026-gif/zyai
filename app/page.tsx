import Link from 'next/link'
import CategoriesBrowser from '@/components/CategoriesBrowser'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'zyAI - Platforma Națională de Anunțuri România | Auto, Imobiliare, Joburi',
  description: 'zyAI este platforma națională de anunțuri din România. Postează gratuit anunțuri auto, imobiliare, joburi și servicii. Caută cu inteligență artificială.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'zyAI România',
  url: 'https://zyai.ro',
  description: 'Platforma națională de anunțuri din România cu AI integrat',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://zyai.ro/marketplace/auto?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
  sameAs: [],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <main className="min-h-screen bg-white pt-16 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Slogan */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
            Spune ce vrei.<br />
            <span className="text-blue-600">zyAI găsește pentru tine.</span>
          </h1>
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
    </>
  )
}
