'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface CoffeeShop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  priceRange: string
  hasWifi: boolean
  hasOutdoor: boolean
  hasPower: boolean
  isQuiet: boolean
  createdAt: string
}

interface City {
  id: string
  name: string
  country: string
  latitude: number
  longitude: number
  description: string
  image: string
  isActive: boolean
  coffeeShopCount: number
  coffeeShops: CoffeeShop[]
  createdAt: string
  updatedAt: string
}

export default function CityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCity(params.id as string)
    }
  }, [params.id])

  const fetchCity = async (id: string) => {
    try {
      const response = await fetch(`/api/cities/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setCity(data.data)
      } else {
        setError('Ciudad no encontrada')
      }
    } catch (_err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!city) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/cities?id=${city.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/cities')
      } else {
        setError(data.error || 'Error al eliminar la ciudad')
        setShowDeleteModal(false)
      }
    } catch (_err) {
      setError('Error de conexión')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ciudad...</p>
        </div>
      </div>
    )
  }

  if (error || !city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin/cities"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Volver a Ciudades
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                ☕ Mood City Guide CMS
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin/cities" className="text-blue-600 hover:text-blue-800">
                Ciudades
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-700">{city.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/cities/${city.id}/editar`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Editar
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* City Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={city.image || 'https://via.placeholder.com/800x400?text=Sin+Imagen'}
                  alt={city.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{city.name}</h2>
                    <p className="text-lg text-gray-600">{city.country}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      city.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {city.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {city.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600">{city.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Latitud:</span>
                    <span className="ml-2 text-gray-600">{city.latitude}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Longitud:</span>
                    <span className="ml-2 text-gray-600">{city.longitude}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Creada:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(city.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Actualizada:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(city.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coffee Shops */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Cafeterías ({city.coffeeShops.length})
                </h3>
              </div>
              <div className="p-6">
                {city.coffeeShops.length > 0 ? (
                  <div className="space-y-4">
                    {city.coffeeShops.map((shop) => (
                      <div key={shop.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{shop.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            shop.priceRange === 'LOW' ? 'bg-green-100 text-green-800' :
                            shop.priceRange === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {shop.priceRange === 'LOW' ? 'Económico' :
                             shop.priceRange === 'MEDIUM' ? 'Medio' : 'Alto'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{shop.address}</p>
                        <div className="flex flex-wrap gap-2">
                          {shop.hasWifi && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">WiFi</span>
                          )}
                          {shop.hasOutdoor && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Terraza</span>
                          )}
                          {shop.hasPower && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Enchufes</span>
                          )}
                          {shop.isQuiet && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Silencioso</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">☕</div>
                    <p className="text-gray-500">No hay cafeterías registradas en esta ciudad</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cafeterías</span>
                  <span className="text-lg font-semibold text-gray-900">{city.coffeeShopCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`text-sm font-medium ${
                    city.isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {city.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Link
                  href={`/admin/cities/${city.id}/editar`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center block"
                >
                  Editar Ciudad
                </Link>
                <Link
                  href={`/admin/cafeterias/nueva?cityId=${city.id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center block"
                >
                  Añadir Cafetería
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Eliminar Ciudad</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar la ciudad &quot;{city.name}&quot;? 
                  Esta acción no se puede deshacer.
                </p>
                {city.coffeeShopCount > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Esta ciudad tiene {city.coffeeShopCount} cafeterías asociadas. 
                    No se puede eliminar hasta que se eliminen todas las cafeterías.
                  </p>
                )}
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting || city.coffeeShopCount > 0}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
