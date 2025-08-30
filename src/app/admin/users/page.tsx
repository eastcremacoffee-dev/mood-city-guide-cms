'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  createdAt: string
  lastLogin?: string
  isActive: boolean
  reviewsCount: number
  favoritesCount: number
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Intentar obtener usuarios reales de la API
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success && result.data) {
        setUsers(result.data)
        console.log(`✅ ${result.data.length} usuarios cargados desde la API`)
      } else {
        // Fallback a datos simulados si la API falla
        console.log('⚠️ API falló, usando datos simulados')
        const mockUsers: User[] = [
          {
            id: '1',
            fullName: 'Usuario Demo',
            email: 'demo@example.com',
            appleId: 'apple_user_123',
            bio: 'Amante del café y explorador de nuevas cafeterías por la ciudad.',
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
        setUsers(mockUsers)
      }
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      ))
      // Aquí iría la llamada real a la API
      console.log(`Toggle status for user ${userId}`)
    } catch (_err) {
      alert('Error al cambiar el estado del usuario')
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeletingUserId(userId)
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error eliminando usuario')
      }

      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user.id !== userId))
      
      alert('Usuario eliminado exitosamente')
    } catch (err: any) {
      alert(`Error eliminando usuario: ${err.message}`)
    } finally {
      setDeletingUserId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los usuarios registrados en la aplicación
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Total: {users.length} usuarios
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                    <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Activos</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.reduce((sum, u) => sum + u.reviewsCount, 0)}
                    </dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Favoritos</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.reduce((sum, u) => sum + u.favoritesCount, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImageURL ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profileImageURL}
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.location && (
                            <div className="text-xs text-gray-400">
                              📍 {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        {user.bio && (
                          <div className="truncate text-xs mb-1">
                            "{user.bio}"
                          </div>
                        )}
                        {user.favoriteType && (
                          <div className="text-xs">
                            ☕ {user.favoriteType}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{user.reviewsCount} reviews</div>
                        <div>{user.favoritesCount} favoritos</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                        {user.lastLogin && (
                          <div className="text-xs">
                            Último: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`transition-colors ${
                            user.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          disabled={deletingUserId === user.id}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingUserId === user.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Eliminando...
                            </span>
                          ) : (
                            'Eliminar'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
