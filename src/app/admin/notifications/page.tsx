'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const notificationTypes = [
  {
    id: 'new_coffee_shop',
    title: 'Nueva Cafetería',
    description: 'Notificar cuando se agregue una nueva cafetería',
    enabled: true
  },
  {
    id: 'favorite_reminder',
    title: 'Recordatorio de Favoritos',
    description: 'Recordar a los usuarios sus cafeterías favoritas',
    enabled: true
  },
  {
    id: 'nearby_recommendations',
    title: 'Recomendaciones Cercanas',
    description: 'Sugerir cafeterías cerca de la ubicación del usuario',
    enabled: true
  },
  {
    id: 'weekly_digest',
    title: 'Resumen Semanal',
    description: 'Enviar resumen de actividad semanal',
    enabled: false
  },
  {
    id: 'review_response',
    title: 'Respuesta a Review',
    description: 'Notificar cuando respondan a una reseña',
    enabled: true
  },
  {
    id: 'special_offer',
    title: 'Oferta Especial',
    description: 'Promociones y descuentos exclusivos',
    enabled: false
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationTypes)
  const [isLoading, setIsLoading] = useState(false)
  const [stats] = useState({
    totalUsers: 1247,
    activeNotifications: 4,
    sentToday: 23
  })

  const handleToggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    )
    alert('Configuración actualizada')
  }

  const handleSendTestNotification = async (notification: { title: string; message: string }) => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Notificación de prueba enviada: ${notification.title}`)
    } catch (error) {
      alert('Error al enviar notificación de prueba')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendBulkNotification = async (notification: { title: string; message: string }) => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Notificación enviada a ${stats.totalUsers} usuarios`)
    } catch (error) {
      alert('Error al enviar notificación masiva')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔔 Notificaciones Push</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las notificaciones push de la aplicación móvil
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-blue-600">👥</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificaciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeNotifications}</p>
              </div>
              <div className="text-green-600">🔔</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviadas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sentToday.toLocaleString()}</p>
              </div>
              <div className="text-purple-600">📤</div>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tipos de Notificaciones</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {notifications.map((notification) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    notification.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.enabled ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <button
                    onClick={() => handleToggleNotification(notification.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {notification.enabled ? 'Desactivar' : 'Activar'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSendTestNotification({ title: notification.title, message: notification.description })}
                      disabled={isLoading || !notification.enabled}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prueba
                    </button>
                    
                    <button
                      onClick={() => handleSendBulkNotification({ title: notification.title, message: notification.description })}
                      disabled={isLoading || !notification.enabled}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Enviar a Todos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
          
          <div className="space-y-4">
            {[
              {
                type: 'Nueva Cafetería',
                message: 'Café Central agregado en Madrid',
                time: 'Hace 2 horas',
                users: 156
              },
              {
                type: 'Recordatorio de Favoritos',
                message: 'Recordatorio semanal enviado',
                time: 'Hace 1 día',
                users: 892
              },
              {
                type: 'Recomendaciones Cercanas',
                message: 'Cafeterías cerca de Barcelona',
                time: 'Hace 2 días',
                users: 234
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-600">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {activity.users} usuarios
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
