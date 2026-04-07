import Link from 'next/link'
import { getAllCategories } from '@/lib/constants/categories'
import Button from '@/components/ui/Button'

export default function Home() {
  const categories = getAllCategories()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
            Cu zyAI găsești ce vrei.
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-8">
            Fără să mai cauți.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Platformă de anunțuri pentru joburi, imobiliare, auto și servicii
          </p>

          {/* Hero Search Bar */}
          <form className="mb-8" action="/marketplace/joburi" method="GET">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                name="q"
                placeholder="Caută anunțuri (ex: apartament Cluj, job IT, masină)"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
              <button type="submit" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg">
                🔍 Caută
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/anunt/nou">
              <Button variant="primary" size="lg">
                ➕ Postează anunț gratuit
              </Button>
            </Link>
            <Link href="/marketplace/joburi">
              <Button variant="secondary" size="lg">
                Răsfoiește anunțuri
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Categorii populare</h2>
          <p className="text-center text-gray-600 mb-12">
            Alege categoria și găsește exact ce cauți
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/marketplace/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition text-center border border-gray-100 hover:border-blue-300">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500">Explore listing</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Cum funcționează</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Caută',
                description: 'Descoperă anunțuri din categoria care te interesează',
                icon: '🔍',
              },
              {
                step: 2,
                title: 'Contactează',
                description: 'Comunică direct cu vânzătorul prin mesaj sau WhatsApp',
                icon: '💬',
              },
              {
                step: 3,
                title: 'Încheia Deal',
                description: 'Finalizează tranzacția în siguranță și ușor',
                icon: '✓',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Gata să postezi?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Postează-ți anunțul gratuit și ajung la mii de potențiali cumpărători
          </p>
          <Link href="/anunt/nou">
            <Button variant="secondary" size="lg">
              Postează acum →
            </Button>
          </Link>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 px-4 bg-yellow-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🛡️ Protejează-te</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              '💰 Plătește după primire și verificare',
              '📍 Intâlnește-te în locuri publice și sigure',
              '🔍 Verifică bunul înainte de plată',
            ].map((tip, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border-l-4 border-yellow-400">
                <p className="text-gray-900 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
