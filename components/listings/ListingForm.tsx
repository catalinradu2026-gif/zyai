'use client'

import { useState } from 'react'
import { createListing } from '@/lib/actions/listings'
import ImageUploader from './ImageUploader'
import { CATEGORIES } from '@/lib/constants/categories'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'

export default function ListingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 0,
    city: '',
    county: '',
    price: '',
    priceType: 'fix',
    currency: 'RON',
  })

  const categories = Object.values(CATEGORIES).flatMap((cat) => [
    { id: cat.slug, name: cat.name, isParent: true },
    ...Object.values(cat.subcategories).map((sub) => ({
      id: sub.slug,
      name: `  ${sub.name}`,
      isParent: false,
    })),
  ])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await createListing({
        title: formData.title,
        description: formData.description,
        categoryId: 1, // TODO: Map category slug to ID from DB
        city: formData.city,
        county: formData.county,
        price: formData.price ? Number(formData.price) : undefined,
        priceType: formData.priceType,
        currency: formData.currency,
        images,
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Eroare la postare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition ${
              s <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-lg">
        {/* Step 1: Category & Title */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Ce dorești să postezi?</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Categorie</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Alege categorie...</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={cat.isParent}
                    className={cat.isParent ? 'font-bold' : ''}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Titlu</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titlu anunț..."
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descriere</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descriere..."
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location & Price */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Locație și preț</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Oraș</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alege oraș...</option>
                {ROMANIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Județ</label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="Județ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tip preț</label>
              <select
                value={formData.priceType}
                onChange={(e) =>
                  setFormData({ ...formData, priceType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fix">Preț fix</option>
                <option value="negociabil">Negociabil</option>
                <option value="gratuit">Gratuit</option>
              </select>
            </div>

            {formData.priceType !== 'gratuit' && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Preț</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-2">Monedă</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Imagini</h2>
            <ImageUploader
              onImagesChange={setImages}
              initialImages={images}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Înapoi
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Continuă →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Se postează...' : '✓ Postează anunț'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
