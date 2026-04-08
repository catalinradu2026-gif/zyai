'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

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

      if (images.length + files.length > MAX_IMAGES) {
        setUploadError(`Maxim ${MAX_IMAGES} imagini permise`)
        return
      }

      // Validare file size (max 5MB pe file)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        setUploadError(`${oversizedFiles.length} fișier(e) prea mare(i). Max 5MB per imagine.`)
        e.target.value = ''
        return
      }

      // Validare file type
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

      // Upload secvențial (una câte una) pentru a evita timeouts
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        let retries = 3

        while (retries > 0) {
          try {
            const fd = new FormData()
            fd.append('file', file)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

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
            retries = 0 // Success, exit retry loop
          } catch (err) {
            retries--
            if (retries === 0) {
              errorCount++
              console.error(`Failed to upload ${file.name}:`, err)
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }

      if (errorCount > 0) {
        setUploadError(`${errorCount} din ${files.length} imagini nu s-au putut încărca. Încearcă din nou.`)
      }

      const updated = [...images, ...newUrls]
      setImages(updated)
      onImagesChange(updated)
      setUploading(false)
      // Reset input
      e.target.value = ''
    },
    [images, onImagesChange]
  )

  async function removeImage(url: string) {
    try {
      // Delete from storage if it's a Supabase URL
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Imagini ({images.length}/{MAX_IMAGES})
        </label>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition ${
          images.length >= MAX_IMAGES
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 cursor-pointer hover:border-blue-500'
        }`}>
          <span className="text-3xl mb-2">📸</span>
          <span className="text-gray-600 text-sm font-medium">
            {uploading ? 'Se încarcă...' : images.length >= MAX_IMAGES ? `Limită ${MAX_IMAGES} imagini atinsă` : 'Click pentru a adăuga imagini'}
          </span>
          {!uploading && images.length < MAX_IMAGES && (
            <span className="text-gray-400 text-xs mt-1">JPG, PNG, WebP — max {MAX_IMAGES} imagini</span>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || images.length >= MAX_IMAGES}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <p className="text-red-600 text-sm">{uploadError}</p>
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
