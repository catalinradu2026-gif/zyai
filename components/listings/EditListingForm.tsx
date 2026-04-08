'use client'

import { useState } from 'react'
import { updateListing } from '@/lib/actions/listings'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ImageUploader from './ImageUploader'

interface EditListingFormProps {
  listing: any
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: listing.title || '',
    description: listing.description || '',
    city: listing.city || '',
    county: listing.county || '',
    price: listing.price || '',
    priceType: listing.price_type || 'fix',
    currency: listing.currency || 'RON',
    images: listing.images || [],
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await updateListing(listing.id, {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        county: formData.county,
        price: formData.price ? Number(formData.price) : undefined,
        priceType: formData.priceType,
        currency: formData.currency,
        images: formData.images,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = `/anunt/${listing.id}`
        }, 1500)
      }
    } catch (err) {
      setError('Eroare la actualizare')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card shadow="md" className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Anunț actualizat! Se redirecționează...</p>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-bold mb-4">Informații de bază</h2>

          <Input
            id="title"
            label="Titlu *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Descriere *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Images */}
          <div className="mt-6">
            <ImageUploader
              initialImages={formData.images}
              onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
            />
          </div>
        </div>

        {/* Location & Price */}
        <div>
          <h2 className="text-xl font-bold mb-4">Locație și preț</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="city"
              label="Oraș *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />

            <Input
              id="county"
              label="Județ"
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input
              id="price"
              label="Preț"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <a
            href={`/anunt/${listing.id}`}
            className="px-6 py-2.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            ← Anulare
          </a>

          <div className="flex-1" />

          <Button variant="primary" size="lg" type="submit" isLoading={loading} fullWidth>
            ✓ Salvează modificări
          </Button>
        </div>
      </form>
    </Card>
  )
}
