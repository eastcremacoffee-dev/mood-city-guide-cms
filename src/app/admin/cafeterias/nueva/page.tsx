'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import AdminLayout from '@/components/AdminLayout'

interface City {
  id: string
  name: string
  country: string
}

interface Feature {
  id: string
  name: string
  iconName: string
  category: string
  isActive: boolean
}

export default function NuevaCafeteriaPage() {
  const router = useRouter()
  const [cities, setCities] = useState<City[]>([])
  const [features, setFeatures] = useState<{[key: string]: Feature[]}>({})
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    website: '',
    instagram: '',
    email: '',
    openingHours: '',
    schedule: {
      monday: { open: '', close: '', isClosed: false },
      tuesday: { open: '', close: '', isClosed: false },
      wednesday: { open: '', close: '', isClosed: false },
      thursday: { open: '', close: '', isClosed: false },
      friday: { open: '', close: '', isClosed: false },
      saturday: { open: '', close: '', isClosed: false },
      sunday: { open: '', close: '', isClosed: false }
    },
    hasWifi: false,
    hasOutdoor: false,
    hasPower: false,
    isQuiet: false,
    priceRange: 'MEDIUM',
    cityId: '',
    images: [
      { url: '', alt: '' },
      { url: '', alt: '' },
      { url: '', alt: '' }
    ]
  })

  useEffect(() => {
    fetchCities()
    fetchFeatures()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      
      if (data.success && data.data) {
        setCities(data.data)
      }
    } catch (_err) {
      console.error('Error loading cities:', _err)
      // Continuar sin ciudades si hay error
      setCities([])
    }
  }

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features')
      const data = await response.json()
      
      if (data.success && data.data) {
        setFeatures(data.data)
      }
    } catch (_err) {
      console.error('Error loading features:', _err)
      // Continuar sin features si hay error
      setFeatures({})
    }
  }

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId)
      } else {
        return [...prev, featureId]
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }))
  }

  // const addImageField = () => {
  //   setFormData(prev => ({
  //     ...prev,
  //     images: [...prev.images, { url: '', alt: '' }]
  //   }))
  // }

  // const removeImageField = (index: number) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     images: prev.images.filter((_, i) => i !== index)
  //   }))
  // }

  const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Solo enviar campos básicos que funcionan
      const basicData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        cityId: formData.cityId
      }

      console.log('Enviando datos básicos:', basicData)

      const response = await fetch('/api/cafeterias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicData),
      })

      const data = await response.json()
      console.log('Respuesta API:', data)

      if (data.success) {
        setSuccess('Cafetería creada exitosamente')
        setTimeout(() => {
          router.push('/admin/cafeterias')
        }, 2000)
      } else {
        setError(data.error || 'Error al crear la cafetería')
        console.error('Error API:', data)
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Cafetería</h1>
            <p className="text-gray-600">Añade una nueva cafetería a la plataforma</p>
          </div>
          <Link
            href="/admin/cafeterias"
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de la cafetería"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ciudad *
                </label>
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar ciudad</option>
                  {cities && cities.length > 0 ? cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country}
                    </option>
                  )) : (
                    <option value="" disabled>Cargando ciudades...</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la cafetería"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              />
            </div>

            {/* Coordenadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Latitud *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="40.4168"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Longitud *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-3.7038"
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@cafeteria.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rango de Precio
                </label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">€ - Económico</option>
                  <option value="MEDIUM">€€ - Medio</option>
                  <option value="HIGH">€€€ - Alto</option>
                </select>
              </div>
            </div>

            {/* Enlaces */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.cafeteria.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@cafeteria"
                />
              </div>
            </div>

            {/* Horarios Estructurados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Horarios de Apertura
              </label>
              <div className="space-y-4">
                {[
                  { key: 'monday', label: 'Lunes' },
                  { key: 'tuesday', label: 'Martes' },
                  { key: 'wednesday', label: 'Miércoles' },
                  { key: 'thursday', label: 'Jueves' },
                  { key: 'friday', label: 'Viernes' },
                  { key: 'saturday', label: 'Sábado' },
                  { key: 'sunday', label: 'Domingo' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4">
                    <div className="w-24">
                      <label className="text-sm font-medium text-gray-700">
                        {label}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.schedule[key as keyof typeof formData.schedule].isClosed}
                        onChange={(e) => handleScheduleChange(key, 'isClosed', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Cerrado</span>
                    </div>
                    {!formData.schedule[key as keyof typeof formData.schedule].isClosed && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                          <input
                            type="time"
                            value={formData.schedule[key as keyof typeof formData.schedule].open}
                            onChange={(e) => handleScheduleChange(key, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                          <input
                            type="time"
                            value={formData.schedule[key as keyof typeof formData.schedule].close}
                            onChange={(e) => handleScheduleChange(key, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Características */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Características
              </label>
              
              {features && Object.keys(features).length > 0 ? Object.entries(features).map(([category, categoryFeatures]) => {
                const categoryNames = {
                  COFFEE: 'Coffee',
                  FOOD_DRINKS: 'Food & Drinks',
                  MORE: 'More'
                }
                
                if (!categoryFeatures || !Array.isArray(categoryFeatures)) {
                  return null
                }
                
                return (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      {categoryNames[category as keyof typeof categoryNames] || category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categoryFeatures.map((feature) => (
                        <label key={feature.id} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => handleFeatureToggle(feature.id)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {feature.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              }) : (
                <div className="text-sm text-gray-500 italic">
                  Cargando características...
                </div>
              )}

              {/* Características básicas (mantener para compatibilidad) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Características Básicas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasWifi"
                      checked={formData.hasWifi}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">WiFi (legacy)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasOutdoor"
                      checked={formData.hasOutdoor}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Terraza (legacy)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasPower"
                      checked={formData.hasPower}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Enchufes (legacy)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isQuiet"
                      checked={formData.isQuiet}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Silencioso (legacy)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Imágenes de la Cafetería */}
            <div className="space-y-8">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Imágenes de la Cafetería
              </h3>
              
              {/* Imagen 1 - Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Imagen Principal *
                </label>
                <ImageUpload
                  currentImage={formData.images[0]?.url}
                  onImageUploaded={(url) => handleImageChange(0, 'url', url)}
                  folder="coffee-shops"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descripción de la imagen
                  </label>
                  <input
                    type="text"
                    value={formData.images[0]?.alt || ''}
                    onChange={(e) => handleImageChange(0, 'alt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la imagen para accesibilidad"
                  />
                </div>
              </div>

              {/* Imagen 2 - Secundaria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Imagen Secundaria 1
                </label>
                <ImageUpload
                  currentImage={formData.images[1]?.url}
                  onImageUploaded={(url) => handleImageChange(1, 'url', url)}
                  folder="coffee-shops"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descripción de la imagen
                  </label>
                  <input
                    type="text"
                    value={formData.images[1]?.alt || ''}
                    onChange={(e) => handleImageChange(1, 'alt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la imagen para accesibilidad"
                  />
                </div>
              </div>

              {/* Imagen 3 - Terciaria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Imagen Secundaria 2
                </label>
                <ImageUpload
                  currentImage={formData.images[2]?.url}
                  onImageUploaded={(url) => handleImageChange(2, 'url', url)}
                  folder="coffee-shops"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descripción de la imagen
                  </label>
                  <input
                    type="text"
                    value={formData.images[2]?.alt || ''}
                    onChange={(e) => handleImageChange(2, 'alt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la imagen para accesibilidad"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-8 border-t border-gray-100">
              <Link
                href="/admin/cafeterias"
                className="px-6 py-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Cafetería'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
