'use client'

import { useState } from 'react'
import { createListing } from '@/lib/actions/listings'
import { CATEGORIES, getCategoryIdBySlug } from '@/lib/constants/categories'
import { getFormFieldsForCategory } from '@/lib/constants/form-fields'
import ImageUploader from './ImageUploader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'

export default function ListingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])

  const [formData, setFormData] = useState<Record<string, string>>({
    // Basic fields
    title: '',
    description: '',
    categoryId: '',
    categorySlug: '',
    city: '',
    county: '',
    price: '',
    priceType: 'fix',
    currency: 'RON',
  })

  // Get categories as flat list
  const categories = Object.entries(CATEGORIES).flatMap(([slug, cat]) => [
    { slug, id: slug, name: cat.name, isParent: true },
    ...Object.entries(cat.subcategories).map(([subSlug, sub]) => ({
      slug: subSlug,
      id: `${slug}-${subSlug}`,
      name: `  ${sub.name}`,
      isParent: false,
      parentSlug: slug,
    })),
  ])

  const categorySpecificFields = getFormFieldsForCategory(formData.categorySlug)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.categorySlug) {
      setError('Completează câmpurile obligatorii')
      return
    }

    if (step < 3) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError('')

    try {
      await createListing({
        title: formData.title,
        description: formData.description,
        categoryId: getCategoryIdBySlug(formData.categorySlug),
        city: formData.city,
        county: formData.county,
        price: formData.price ? Number(formData.price) : undefined,
        priceType: formData.priceType,
        currency: formData.currency,
        images,
        // Pass additional category-specific data in description for now
        // In production, this should be stored in a separate JSON column
      })
    } catch (err) {
      setError('Eroare la postare. Încercați din nou.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  function handleCategoryChange(categorySlug: string) {
    setFormData({
      ...formData,
      categorySlug,
      categoryId: categorySlug,
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Postează un anunț</h1>
          <p className="text-gray-600">Completează formularul pas cu pas pentru a-ți publica anunțul</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  s <= step ? 'bg-blue-600' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step Indicator */}
        <p className="text-sm text-gray-600 mb-6">
          Pasul {step} din 3
        </p>

        {/* Form */}
        <Card shadow="md" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">❌ {error}</p>
              </div>
            )}

            {/* STEP 1: Category & Title */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ce dorești să postezi?</h2>

                  {/* Category Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-900">
                      Alege categoria
                    </label>

                    {/* Main Categories as Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(CATEGORIES).map(([slug, cat]) => (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => handleCategoryChange(slug)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            formData.categorySlug === slug
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Subcategories */}
                    {formData.categorySlug && (CATEGORIES as Record<string, any>)[formData.categorySlug]?.subcategories && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase">
                          Subcategorie
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries((CATEGORIES as Record<string, any>)[formData.categorySlug].subcategories).map(
                            ([subSlug, subCat]: [string, any]) => (
                              <button
                                key={subSlug}
                                type="button"
                                onClick={() => handleCategoryChange(subSlug)}
                                className={`p-3 rounded-lg border text-sm transition-all ${
                                  formData.categorySlug === subSlug
                                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                {subCat.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Descrie ce vinzi</h3>

                  <Input
                    id="title"
                    label="Titlu anunț *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ex: Apartament 2 camere, centru"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descriere detaliată *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrie oferta în detaliu..."
                    required
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Category-Specific Fields & Location & Price */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Detalii adiționale</h2>

                {/* Category-Specific Fields */}
                {categorySpecificFields.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-4">
                      Informații specifice pentru {(CATEGORIES as Record<string, any>)[formData.categorySlug]?.name}
                    </h3>

                    <div className="space-y-4">
                      {categorySpecificFields.map((field) => {
                        if (field.type === 'select') {
                          return (
                            <Select
                              key={field.name}
                              id={field.name}
                              label={field.label}
                              value={formData[field.name] || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, [field.name]: e.target.value })
                              }
                              helperText={field.helperText}
                            >
                              <option value="">Alege...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          )
                        } else if (field.type === 'textarea') {
                          return (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                {field.label}
                              </label>
                              <textarea
                                value={formData[field.name] || ''}
                                onChange={(e) =>
                                  setFormData({ ...formData, [field.name]: e.target.value })
                                }
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )
                        } else {
                          return (
                            <Input
                              key={field.name}
                              id={field.name}
                              label={field.label}
                              type={field.type}
                              value={formData[field.name] || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, [field.name]: e.target.value })
                              }
                              placeholder={field.placeholder}
                              helperText={field.helperText}
                            />
                          )
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Locație</h3>

                  <Input
                    id="city"
                    label="Oraș *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="ex: București"
                    required
                  />

                  <Input
                    id="county"
                    label="Județ / Provincie"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    placeholder="ex: Ilfov"
                    className="mt-4"
                  />
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Preț</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      id="price"
                      label="Preț"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />

                    <Select
                      id="priceType"
                      label="Tip preț"
                      value={formData.priceType}
                      onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                    >
                      <option value="fix">Fix</option>
                      <option value="negociabil">Negociabil</option>
                      <option value="gratuit">Gratuit</option>
                    </Select>

                    <Select
                      id="currency"
                      label="Monedă"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="RON">RON</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Images & Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Imagini și finalizare</h2>

                <div>
                  <h3 className="text-lg font-bold mb-4">Adaugă imagini</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Anunțurile cu imagini se vând mai ușor. Minimum 1, maxim 10 imagini.
                  </p>
                  <ImageUploader onImagesChange={setImages} initialImages={images} />
                </div>

                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Previzualizare anunț</h3>

                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="font-medium text-gray-900">Titlu:</span> {formData.title}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Categorie:</span>{' '}
                      {(CATEGORIES as Record<string, any>)[formData.categorySlug]?.name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Locație:</span> {formData.city}{' '}
                      {formData.county && `(${formData.county})`}
                    </p>
                    {formData.price && (
                      <p>
                        <span className="font-medium text-gray-900">Preț:</span> {formData.price}{' '}
                        {formData.currency}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-900">Imagini:</span> {images.length}/10
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              {step > 1 && (
                <Button variant="secondary" size="lg" onClick={handleBack} type="button">
                  ← Înapoi
                </Button>
              )}

              <div className="flex-1" />

              {step < 3 ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  disabled={
                    !formData.title ||
                    !formData.description ||
                    !formData.categorySlug ||
                    (step === 2 && (!formData.city || !formData.county))
                  }
                >
                  Continuă →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  isLoading={loading}
                >
                  ✓ Postează anunț
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
