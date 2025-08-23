'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

interface City {
  id: string
  name: string
  country: string
}

interface CoffeeShop {
  id: string
  name: string
  description: string
  address: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  instagram: string | null
  email: string | null
  openingHours: string | null
  priceRange: string
  rating: number
  reviewCount: number
  favoriteCount: number
  isActive: boolean
  cityId: string
  city: City
  createdAt: string
  updatedAt: string
}

export default function VerCafeteriaPage() {
  const params = useParams()
  const id = params.id as string

  const [coffeeShop, setCoffeeShop] = useState<CoffeeShop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCoffeeShop()
  }, [id])

  const fetchCoffeeShop = async () => {
    try {
      const response = await fetch('/api/cafeterias')
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        // Buscar la cafetería específica por ID
        const shop = data.data.find((cafe: any) => cafe.id === id)
        
        if (!shop) {
          setError('Cafetería no encontrada')
        } else {
          setCoffeeShop(shop)
        }
      } else {
        setError('Error al cargar la cafetería')
      }
    } catch (err) {
      console.error('Error loading coffee shop:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
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

  if (error || !coffeeShop) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Cafetería no encontrada'}
          </h3>
          <Link
            href="/admin/cafeterias"
            className="text-blue-600 hover:text-blue-900"
          >
            Volver al listado
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'LOW': return '€ - Económico'
      case 'MEDIUM': return '€€ - Medio'
      case 'HIGH': return '€€€ - Alto'
      default: return range
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{coffeeShop.name}</h1>
            <p className="text-gray-600">Información detallada de la cafetería</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/cafeterias/${coffeeShop.id}/editar`}
              className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-2 px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </Link>
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

        {/* Estado */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
            {coffeeShop.isActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Activa
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Inactiva
              </span>
            )}
          </div>
        </div>

        {/* Información Básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <p className="text-sm text-gray-900">{coffeeShop.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <p className="text-sm text-gray-900">{coffeeShop.city.name}, {coffeeShop.city.country}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p className="text-sm text-gray-900">{coffeeShop.description || 'Sin descripción'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <p className="text-sm text-gray-900">{coffeeShop.address}</p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
              <p className="text-sm text-gray-900">{coffeeShop.latitude || 'No especificada'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
              <p className="text-sm text-gray-900">{coffeeShop.longitude || 'No especificada'}</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <p className="text-sm text-gray-900">{coffeeShop.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{coffeeShop.email || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
              {coffeeShop.website ? (
                <a href={coffeeShop.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-900">
                  {coffeeShop.website}
                </a>
              ) : (
                <p className="text-sm text-gray-900">No especificado</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <p className="text-sm text-gray-900">{coffeeShop.instagram || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Precio</label>
              <p className="text-sm text-gray-900">{getPriceRangeText(coffeeShop.priceRange)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{coffeeShop.rating.toFixed(1)}</span>
                <span className="ml-1 text-yellow-400">⭐</span>
                <span className="ml-2 text-xs text-gray-500">({coffeeShop.reviewCount} reviews)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favoritos</label>
              <p className="text-sm text-gray-900">{coffeeShop.favoriteCount} usuarios</p>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Horarios</h2>
          <p className="text-sm text-gray-900">{coffeeShop.openingHours || 'No especificados'}</p>
        </div>

        {/* Metadatos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <p className="text-sm text-gray-900 font-mono">{coffeeShop.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
              <p className="text-sm text-gray-900">{new Date(coffeeShop.createdAt).toLocaleString('es-ES')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
              <p className="text-sm text-gray-900">{new Date(coffeeShop.updatedAt).toLocaleString('es-ES')}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
