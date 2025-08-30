'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

interface User {
  id: string
  fullName: string
  email: string
  appleId?: string
  bio?: string
  location?: string
  favoriteType?: string
  profileImageURL?: string
  language?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
  reviewsCount: number
  favoritesCount: number
}

interface UserReview {
  id: string
  coffeeShopName: string
  rating: number
  comment: string
  createdAt: string
}

interface UserFavorite {
  id: string
  coffeeShopName: string
  coffeeShopLocation: string
  addedAt: string
}

interface UserVisit {
  id: string
  coffeeShopName: string
  visitDate: string
  durationMinutes: number
  rating: number
  notes: string
}

interface UserReferral {
  id: string
  referredUserName: string
  referredUserEmail: string
  status: string
  createdAt: string
  completedAt?: string
}

interface UserNotification {
  id: string
  title: string
  message: string
  type: string
  status: string
  priority: string
  createdAt: string
  readAt?: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [visits, setVisits] = useState<UserVisit[]>([])
  const [referrals, setReferrals] = useState<UserReferral[]>([])
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews' | 'favorites' | 'visits' | 'referrals' | 'notifications'>('profile')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    console.log('🔍 UserDetailPage loaded with delete functionality')
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Intentar obtener usuario real de la API
      const response = await fetch(`/api/users/${userId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const userData = result.data
        setUser(userData)
        setReviews(userData.reviews || [])
        setFavorites(userData.favorites || [])
        setVisits(userData.visits || [])
        setReferrals(userData.referrals || [])
        setNotifications(userData.notifications || [])
        console.log(`✅ Usuario ${userId} cargado desde la API`)
        return
      }
      
      // Fallback a datos simulados si la API falla
      console.log('⚠️ API falló, usando datos simulados')
      const mockUsers: User[] = [
        {
          id: '1',
          fullName: 'Usuario Demo',
          email: 'demo@example.com',
          appleId: 'apple_user_123',
          bio: 'Amante del café y explorador de nuevas cafeterías por la ciudad. Me encanta descubrir lugares únicos con buen ambiente y café de calidad.',
          location: 'Madrid, España',
          favoriteType: 'Cappuccino',
          profileImageURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          reviewsCount: 5,
          favoritesCount: 12
        },
        {
          id: '2',
          fullName: 'María García',
          email: 'maria@example.com',
          appleId: 'apple_user_456',
          bio: 'Diseñadora gráfica que disfruta trabajando en cafeterías con buen ambiente.',
          location: 'Barcelona, España',
          favoriteType: 'Latte',
          profileImageURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
          isActive: true,
          reviewsCount: 3,
          favoritesCount: 8
        },
        {
          id: '3',
          fullName: 'Carlos López',
          email: 'carlos@example.com',
          appleId: 'apple_user_789',
          bio: 'Estudiante universitario en busca de lugares tranquilos para estudiar.',
          location: 'Valencia, España',
          favoriteType: 'Americano',
          profileImageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(),
          isActive: false,
          reviewsCount: 1,
          favoritesCount: 3
        }
      ]

      const foundUser = mockUsers.find(u => u.id === userId)
      if (!foundUser) {
        throw new Error('Usuario no encontrado')
      }
      
      setUser(foundUser)

      // Simular reviews del usuario
      const mockReviews: UserReview[] = [
        {
          id: '1',
          coffeeShopName: 'Café Central',
          rating: 5,
          comment: 'Excelente café y ambiente muy acogedor. Perfecto para trabajar.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '2',
          coffeeShopName: 'Starbucks Plaza Mayor',
          rating: 4,
          comment: 'Buen servicio aunque un poco ruidoso en horas pico.',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
          id: '3',
          coffeeShopName: 'Toma Café',
          rating: 5,
          comment: 'Mi lugar favorito para el desayuno. Café de especialidad increíble.',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
        }
      ]

      // Simular favoritos del usuario
      const mockFavorites: UserFavorite[] = [
        {
          id: '1',
          coffeeShopName: 'Café Central',
          coffeeShopLocation: 'Centro, Madrid',
          addedAt: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
          id: '2',
          coffeeShopName: 'Toma Café',
          coffeeShopLocation: 'Malasaña, Madrid',
          addedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: '3',
          coffeeShopName: 'Federal Café',
          coffeeShopLocation: 'Conde Duque, Madrid',
          addedAt: new Date(Date.now() - 86400000 * 7).toISOString()
        }
      ]

      setReviews(mockReviews.slice(0, foundUser.reviewsCount))
      setFavorites(mockFavorites.slice(0, foundUser.favoritesCount))
      
      // Simular visitas del usuario
      const mockVisits: UserVisit[] = [
        {
          id: '1',
          coffeeShopName: 'Café Central',
          visitDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          durationMinutes: 45,
          rating: 5,
          notes: 'Excelente café y ambiente muy acogedor'
        },
        {
          id: '2',
          coffeeShopName: 'Starbucks Plaza Mayor',
          visitDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          durationMinutes: 30,
          rating: 4,
          notes: 'Buen servicio aunque un poco ruidoso'
        },
        {
          id: '3',
          coffeeShopName: 'Toma Café',
          visitDate: new Date(Date.now() - 86400000 * 10).toISOString(),
          durationMinutes: 60,
          rating: 5,
          notes: 'Mi lugar favorito para trabajar'
        }
      ]

      // Simular referidos del usuario
      const mockReferrals: UserReferral[] = [
        {
          id: '1',
          referredUserName: 'Ana García',
          referredUserEmail: 'ana@example.com',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          completedAt: new Date(Date.now() - 86400000 * 10).toISOString()
        },
        {
          id: '2',
          referredUserName: 'Carlos López',
          referredUserEmail: 'carlos@example.com',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ]

      // Simular notificaciones del usuario
      const mockNotifications: UserNotification[] = [
        {
          id: '1',
          title: 'Bienvenido a MoodCityGuide',
          message: 'Gracias por unirte a nuestra comunidad de amantes del café',
          type: 'system',
          status: 'read',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          readAt: new Date(Date.now() - 86400000 * 29).toISOString()
        },
        {
          id: '2',
          title: 'Nueva cafetería cerca',
          message: 'Hemos añadido una nueva cafetería a 500m de tu ubicación',
          type: 'general',
          status: 'read',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          readAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '3',
          title: 'Oferta especial',
          message: '20% de descuento en tu próxima visita a Café Central',
          type: 'promotion',
          status: 'unread',
          priority: 'high',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
        }
      ]

      setVisits(mockVisits)
      setReferrals(mockReferrals)
      setNotifications(mockNotifications)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async () => {
    if (!user) return
    
    try {
      setUser({ ...user, isActive: !user.isActive })
      // Aquí iría la llamada real a la API
      console.log(`Toggle status for user ${user.id}`)
    } catch (err) {
      alert('Error al cambiar el estado del usuario')
    }
  }

  const handleDeleteUser = async () => {
    console.log('🗑️ handleDeleteUser called')
    if (!user) return

    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.fullName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeleting(true)
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error eliminando usuario')
      }

      alert('Usuario eliminado exitosamente')
      router.push('/admin/users')
    } catch (err: any) {
      alert(`Error eliminando usuario: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Usuario no encontrado'}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalle del Usuario - VERSIÓN CON ELIMINAR</h1>
              <p className="mt-1 text-sm text-gray-500">
                Información completa del perfil de usuario
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              user.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={toggleUserStatus}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                user.isActive
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {user.isActive ? 'Desactivar' : 'Activar'}
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </span>
              ) : (
                'Eliminar Usuario'
              )}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {user.profileImageURL ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={user.profileImageURL}
                    alt={user.fullName}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-medium text-gray-700">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.location && (
                  <p className="text-gray-500 text-sm">📍 {user.location}</p>
                )}
                {user.appleId && (
                  <p className="text-gray-400 text-xs mt-1">Apple ID: {user.appleId}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  <div>Registrado: {new Date(user.createdAt).toLocaleDateString()}</div>
                  {user.lastLogin && (
                    <div>Último acceso: {new Date(user.lastLogin).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">{user.reviewsCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Favoritos</dt>
                    <dd className="text-lg font-medium text-gray-900">{user.favoritesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Café Favorito</dt>
                    <dd className="text-lg font-medium text-gray-900">{user.favoriteType || 'No especificado'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Visitas</dt>
                    <dd className="text-lg font-medium text-gray-900">{visits.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Referidos</dt>
                    <dd className="text-lg font-medium text-gray-900">{referrals.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM16 3H4v14h12V3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Notificaciones</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {notifications.filter(n => n.status === 'unread').length} sin leer
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({user.reviewsCount})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Favoritos ({user.favoritesCount})
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visits'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visitas ({visits.length})
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'referrals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Referencias ({referrals.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notificaciones ({notifications.filter(n => n.status === 'unread').length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Perfil</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                      <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                      <p className="mt-1 text-sm text-gray-900">{user.location || 'No especificada'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Café Favorito</label>
                      <p className="mt-1 text-sm text-gray-900">{user.favoriteType || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Idioma</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {user.language === 'es' ? '🇪🇸 Español' : 
                           user.language === 'en' ? '🇺🇸 English' :
                           user.language === 'fr' ? '🇫🇷 Français' :
                           user.language === 'de' ? '🇩🇪 Deutsch' :
                           user.language === 'it' ? '🇮🇹 Italiano' :
                           user.language === 'pt' ? '🇵🇹 Português' :
                           '🇪🇸 Español (por defecto)'}
                        </span>
                        <select 
                          className="ml-2 text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue={user.language || 'es'}
                          onChange={(e) => {
                            // Aquí iría la lógica para actualizar el idioma
                            console.log('Cambiar idioma a:', e.target.value)
                          }}
                        >
                          <option value="es">🇪🇸 Español</option>
                          <option value="en">🇺🇸 English</option>
                          <option value="fr">🇫🇷 Français</option>
                          <option value="de">🇩🇪 Deutsch</option>
                          <option value="it">🇮🇹 Italiano</option>
                          <option value="pt">🇵🇹 Português</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {user.bio && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700">Biografía</label>
                      <p className="mt-1 text-sm text-gray-900">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Reviews del Usuario</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.coffeeShopName}</h4>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay reviews disponibles.</p>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Cafeterías Favoritas</h3>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{favorite.coffeeShopName}</h4>
                            <p className="text-sm text-gray-600">{favorite.coffeeShopLocation}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(favorite.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay favoritos disponibles.</p>
                )}
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Historial de Visitas</h3>
                {visits.length > 0 ? (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{visit.coffeeShopName}</h4>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Fecha:</span> {new Date(visit.visitDate).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Duración:</span> {visit.durationMinutes} min
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium mr-2">Rating:</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < visit.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {visit.notes && (
                              <div className="mt-2">
                                <span className="font-medium text-sm text-gray-600">Notas:</span>
                                <p className="text-sm text-gray-700 mt-1">{visit.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay visitas registradas.</p>
                )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Referencias y Referidos</h3>
                {referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{referral.referredUserName}</h4>
                            <p className="text-sm text-gray-600">{referral.referredUserEmail}</p>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                referral.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : referral.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {referral.status === 'completed' ? 'Completado' : 
                                 referral.status === 'pending' ? 'Pendiente' : 'Expirado'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Referido: {new Date(referral.createdAt).toLocaleDateString()}
                              </span>
                              {referral.completedAt && (
                                <span className="text-xs text-gray-500">
                                  Completado: {new Date(referral.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay referidos registrados.</p>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                    Enviar Notificación
                  </button>
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`border rounded-lg p-4 ${
                        notification.status === 'unread' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                notification.type === 'system' ? 'bg-gray-100 text-gray-800' :
                                notification.type === 'promotion' ? 'bg-green-100 text-green-800' :
                                notification.type === 'general' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {notification.type === 'system' ? 'Sistema' :
                                 notification.type === 'promotion' ? 'Promoción' :
                                 notification.type === 'general' ? 'General' : 'Referido'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.priority === 'high' ? 'Alta' :
                                 notification.priority === 'normal' ? 'Normal' : 'Baja'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{notification.message}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Enviado: {new Date(notification.createdAt).toLocaleDateString()}</span>
                              {notification.readAt && (
                                <span>Leído: {new Date(notification.readAt).toLocaleDateString()}</span>
                              )}
                              <span className={`font-medium ${
                                notification.status === 'unread' ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {notification.status === 'unread' ? 'Sin leer' : 'Leído'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay notificaciones.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
