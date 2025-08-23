'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
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

interface CoffeeShop {
  id: string
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  phone: string
  website: string
  instagram: string
  email: string
  openingHours: string
  hasWifi: boolean
  hasOutdoor: boolean
  hasPower: boolean
  isQuiet: boolean
  priceRange: string
  cityId: string
  city: City
  images: Array<{ url: string; alt: string }>
  features: Array<Feature>
  isActive: boolean
}

export default function EditarCafeteriaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [cities, setCities] = useState<City[]>([])
  const [features, setFeatures] = useState<{[key: string]: Feature[]}>({})
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  // const [coffeeShop, setCoffeeShop] = useState<CoffeeShop | null>(null) // Removed unused variable
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    ],
    isActive: true
  })

  useEffect(() => {
    fetchCities()
    fetchFeatures()
    fetchCoffeeShop()
  }, [id])

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

  const fetchCoffeeShop = async () => {
    try {
      const response = await fetch(`/api/cafeterias?id=${id}`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        const shop = data.data[0]
        // setCoffeeShop(shop) // Removed unused state
        
        // Llenar el formulario con los datos existentes
        setFormData({
          name: shop.name || '',
          description: shop.description || '',
          address: shop.address || '',
          latitude: shop.latitude?.toString() || '',
          longitude: shop.longitude?.toString() || '',
          phone: shop.phone || '',
          website: shop.website || '',
          instagram: shop.instagram || '',
          email: shop.email || '',
          openingHours: shop.openingHours || '',
          schedule: (() => {
            // Si openingHours es un objeto (horarios estructurados), usarlo
            if (typeof shop.openingHours === 'object' && shop.openingHours !== null) {
              return {
                monday: shop.openingHours.monday || { open: '', close: '', isClosed: false },
                tuesday: shop.openingHours.tuesday || { open: '', close: '', isClosed: false },
                wednesday: shop.openingHours.wednesday || { open: '', close: '', isClosed: false },
                thursday: shop.openingHours.thursday || { open: '', close: '', isClosed: false },
                friday: shop.openingHours.friday || { open: '', close: '', isClosed: false },
                saturday: shop.openingHours.saturday || { open: '', close: '', isClosed: false },
                sunday: shop.openingHours.sunday || { open: '', close: '', isClosed: false }
              }
            }
            // Si no, usar valores por defecto
            return {
              monday: { open: '', close: '', isClosed: false },
              tuesday: { open: '', close: '', isClosed: false },
              wednesday: { open: '', close: '', isClosed: false },
              thursday: { open: '', close: '', isClosed: false },
              friday: { open: '', close: '', isClosed: false },
              saturday: { open: '', close: '', isClosed: false },
              sunday: { open: '', close: '', isClosed: false }
            }
          })(),
          hasWifi: shop.hasWifi || false,
          hasOutdoor: shop.hasOutdoor || false,
          hasPower: shop.hasPower || false,
          isQuiet: shop.isQuiet || false,
          priceRange: shop.priceRange || 'MEDIUM',
          cityId: shop.cityId || '',
          images: (() => {
            const existingImages = shop.images || []
            const images = [
              existingImages[0] || { url: '', alt: '' },
              existingImages[1] || { url: '', alt: '' },
              existingImages[2] || { url: '', alt: '' }
            ]
            return images
          })(),
          isActive: shop.isActive !== false
        })

        // Cargar features seleccionadas
        if (shop.features && shop.features.length > 0) {
          const currentFeatures = shop.features.map((f: Feature) => f.id)
          setSelectedFeatures(currentFeatures)
        }
      } else {
        setError('Cafetería no encontrada')
      }
    } catch (_err) {
      console.error(_err)
      setError('Error al cargar la cafetería: ' + (_err instanceof Error ? _err.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
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
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Filtrar imágenes vacías
      const validImages = formData.images.filter(img => img.url.trim() !== '')

      const response = await fetch('/api/cafeterias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData,
          openingHours: formData.schedule, // Enviar horarios estructurados
          images: validImages.length > 0 ? validImages : undefined,
          selectedFeatures: selectedFeatures
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Cafetería actualizada exitosamente')
        setTimeout(() => {
          router.push('/admin/cafeterias')
        }, 2000)
      } else {
        setError(data.error || 'Error al actualizar la cafetería')
      }
    } catch (_err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cafetería?')) {
      return
    }

    try {
      const response = await fetch(`/api/cafeterias?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Cafetería eliminada exitosamente')
        setTimeout(() => {
          router.push('/admin/cafeterias')
        }, 2000)
      } else {
        setError(data.error || 'Error al eliminar la cafetería')
      }
    } catch (_err) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando cafetería...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Cafetería</h1>
            <p className="text-gray-600">Modifica la información de la cafetería</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900 flex items-center space-x-2 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Eliminar</span>
            </button>
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Estado */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Cafetería activa</span>
              </label>
            </div>

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
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/cafeterias"
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
