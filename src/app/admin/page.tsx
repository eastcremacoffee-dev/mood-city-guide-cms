'use client'

import { useState, useEffect } from 'react'
// import Link from 'next/link' // Removed unused import
import AdminLayout from '@/components/AdminLayout'

interface Stats {
  totalCities: number
  totalCoffeeShops: number
  totalUsers: number
  totalReviews: number
  avgRating: number
  totalFavorites: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalCities: 0,
    totalCoffeeShops: 0,
    totalUsers: 0,
    totalReviews: 0,
    avgRating: 0,
    totalFavorites: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch cities
      const citiesResponse = await fetch('/api/cities')
      const citiesData = await citiesResponse.json()
      
      // Fetch coffee shops
      const coffeeShopsResponse = await fetch('/api/cafeterias')
      const coffeeShopsData = await coffeeShopsResponse.json()
      
      if (citiesData.success && coffeeShopsData.success) {
        const coffeeShops = coffeeShopsData.data
        const totalReviews = coffeeShops.reduce((sum: number, shop: { reviewCount: number }) => sum + shop.reviewCount, 0)
        const totalFavorites = coffeeShops.reduce((sum: number, shop: { favoriteCount: number }) => sum + shop.favoriteCount, 0)
        const avgRating = coffeeShops.length > 0 
          ? coffeeShops.reduce((sum: number, shop: { rating: number }) => sum + shop.rating, 0) / coffeeShops.length
          : 0

        setStats({
          totalCities: citiesData.count,
          totalCoffeeShops: coffeeShopsData.count,
          totalUsers: 2, // From seed data
          totalReviews,
          avgRating,
          totalFavorites
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600">View your coffee shop platform overview</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-1">Total cafeterías</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCoffeeShops}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-1">Ciudades activas</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCities}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-1">Total reviews</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalReviews}</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Distribution by Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Distribution by 
                  <select className="ml-2 text-lg font-semibold border-none bg-transparent focus:outline-none cursor-pointer">
                    <option>Categories</option>
                  </select>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">Cafeterías Premium</span>
                    <span className="text-sm font-medium">27%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">Cafeterías Standard</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">Nuevas Cafeterías</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">Con Features Especiales</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">Otras</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeDasharray="67.8 184.2"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeDasharray="62.8 189.2"
                        strokeDashoffset="-67.8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="8"
                        strokeDasharray="45.2 206.8"
                        strokeDashoffset="-130.6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activities */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">Admin agregó una nueva cafetería:</p>
                    <p className="text-sm text-gray-600">East Crema Coffee Almirante</p>
                    <p className="text-xs text-gray-400">hace 1 día</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">Admin actualizó features:</p>
                    <p className="text-sm text-gray-600">Sistema de horarios mejorado</p>
                    <p className="text-xs text-gray-400">hace 2 días</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">Admin mejoró el sistema:</p>
                    <p className="text-sm text-gray-600">UI del CMS rediseñada</p>
                    <p className="text-xs text-gray-400">hace 3 días</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">Admin configuró Cloudinary:</p>
                    <p className="text-sm text-gray-600">Sistema de imágenes activado</p>
                    <p className="text-xs text-gray-400">hace 4 días</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Ver toda la actividad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            <p className="text-sm text-gray-600">Summary of your coffee shop platform</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Cafeterías activas
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Reviews promedio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Participación
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Rating promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Cafeterías Premium
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalCoffeeShops * 0.53)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalReviews * 0.6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    53 %
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(stats.avgRating + 0.3).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Cafeterías Standard
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalCoffeeShops * 0.32)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalReviews * 0.25)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    32 %
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stats.avgRating.toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Nuevas Cafeterías
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalCoffeeShops * 0.15)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Math.round(stats.totalReviews * 0.15)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    15 %
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(stats.avgRating - 0.2).toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
