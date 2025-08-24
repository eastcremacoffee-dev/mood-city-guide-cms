'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import ImageUpload from '@/components/ImageUpload'

export default function NewCityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    latitude: '',
    longitude: '',
    description: '',
    image: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/cities')
      } else {
        setError(data.error || 'Error al crear la ciudad')
      }
    } catch (_err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Ciudad</h1>
            <p className="mt-1 text-sm text-gray-500">
              Completa los datos para añadir una nueva ciudad al sistema
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/cities"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ← Volver a Ciudades
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Ciudad *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Madrid"
                />
              </div>

              {/* País */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: España"
                />
              </div>

              {/* Latitud */}
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud *
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 40.4168"
                />
              </div>

              {/* Longitud */}
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud *
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: -3.7038"
                />
              </div>
            </div>

            {/* URL de Imagen */}
            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Imagen de la Ciudad
              </label>
              <ImageUpload
                currentImage={formData.image}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
                folder="cities"
              />
              <p className="mt-2 text-sm text-gray-500">
                Sube una imagen representativa de la ciudad (opcional)
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción breve de la ciudad y su cultura cafetera..."
              />
            </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href="/admin/cities"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear Ciudad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
