'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

const FREE_LIMIT = 1
const MAX_IMAGES = 8

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
}

export default function ImageUploader({ onImagesChange, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      if (images.length >= FREE_LIMIT) {
        setUploadError('Poți adăuga o singură poză gratuit. Upgrade pentru mai multe.')
        e.target.value = ''
        return
      }

      if (images.length + files.length > FREE_LIMIT) {
        setUploadError(`Planul gratuit permite doar ${FREE_LIMIT} imagine. Upgrade pentru mai multe.`)
        e.target.value = ''
        return
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        setUploadError(`${oversizedFiles.length} fișier(e) prea mare(i). Max 5MB per imagine.`)
        e.target.value = ''
        return
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      const invalidFiles = files.filter(f => !allowedTypes.includes(f.type))
      if (invalidFiles.length > 0) {
        setUploadError(`Formate neacceptate. Folosește: JPG, PNG, WebP, GIF`)
        e.target.value = ''
        return
      }

      setUploading(true)
      setUploadError('')
      const newUrls: string[] = []
      let errorCount = 0

      // Uploadăm doar primul fișier (limita gratuită)
      const filesToUpload = files.slice(0, FREE_LIMIT - images.length)

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        let retries = 3

        while (retries > 0) {
          try {
            const fd = new FormData()
            fd.append('file', file)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            const res = await fetch('/api/upload', {
              method: 'POST',
              body: fd,
              signal: controller.signal,
            })

            clearTimeout(timeoutId)
            const data = await res.json()

            if (!res.ok || data.error) {
              throw new Error(data.error || 'Upload failed')
            }

            newUrls.push(data.url)
            retries = 0
          } catch (err) {
            retries--
            if (retries === 0) {
              errorCount++
              console.error(`Failed to upload ${file.name}:`, err)
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }

      if (errorCount > 0) {
        setUploadError(`Imaginea nu s-a putut încărca. Încearcă din nou.`)
      }

      const updated = [...images, ...newUrls]
      setImages(updated)
      onImagesChange(updated)
      setUploading(false)
      e.target.value = ''
    },
    [images, onImagesChange]
  )

  async function removeImage(url: string) {
    try {
      if (url.includes('supabase.co')) {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        })
      }

      const updated = images.filter((img) => img !== url)
      setImages(updated)
      onImagesChange(updated)
    } catch (err) {
      console.error('Error removing image:', err)
      setUploadError('Eroare la ștergerea imaginii')
    }
  }

  const atFreeLimit = images.length >= FREE_LIMIT

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Imagini ({images.length}/{FREE_LIMIT} gratuit)
        </label>

        {atFreeLimit ? (
          /* Banner upgrade — apare când limita gratuită e atinsă */
          <div className="rounded-xl p-5 text-center space-y-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12))',
              border: '1px dashed rgba(139,92,246,0.5)',
            }}>
            <div className="text-2xl">🔒</div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Poze suplimentare — funcție Premium
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Planul gratuit include 1 poză. Upgrade pentru până la {MAX_IMAGES} imagini și mai multă vizibilitate.
            </p>
            <button
              type="button"
              disabled
              className="mt-1 px-4 py-2 rounded-lg text-xs font-bold text-white opacity-60 cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
            >
              ⭐ Upgrade (în curând)
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition cursor-pointer hover:border-purple-500"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-3xl mb-2">📸</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {uploading ? 'Se încarcă...' : 'Click pentru a adăuga o imagine'}
            </span>
            {!uploading && (
              <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                JPG, PNG, WebP — 1 imagine gratuită
              </span>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {uploadError && (
        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>❌ {uploadError}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group">
              {i === 0 && (
                <span className="absolute top-1 left-1 z-10 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  Principală
                </span>
              )}
              <Image
                src={url}
                alt={`imagine ${i + 1}`}
                width={200}
                height={150}
                className="w-full h-28 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
              >
                <span className="text-white text-xl">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
