'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (url: string) => void
  folder?: string
  className?: string
}

export default function ImageUpload({ 
  currentImage, 
  onImageUploaded, 
  folder = 'coffee-shops',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(currentImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP')
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Crear preview local
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Subir archivo
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload?folder=${folder}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setPreviewUrl(data.data.url)
        onImageUploaded(data.data.url)
        
        // Limpiar preview local
        URL.revokeObjectURL(localPreview)
      } else {
        setError(data.error || 'Error al subir la imagen')
        setPreviewUrl(currentImage || '')
      }
    } catch (_err) {
      setError('Error de conexión')
      setPreviewUrl(currentImage || '')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl('')
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Área de preview/upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-64 rounded-lg shadow-md"
            />
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={handleClickUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {uploading ? 'Subiendo...' : 'Cambiar Imagen'}
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <button
                type="button"
                onClick={handleClickUpload}
                disabled={uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? 'Subiendo...' : 'Subir Imagen'}
              </button>
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, WebP hasta 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Subiendo imagen...</span>
        </div>
      )}
    </div>
  )
}
