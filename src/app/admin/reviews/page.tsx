'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
  }
  coffeeShop: {
    id: string
    name: string
    city: string
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reviews')
      if (!response.ok) {
        throw new Error('Error al cargar las reviews')
      }
      const data = await response.json()
      setReviews(data.data || [])
    } catch (_err) {
              setError(_err instanceof Error ? _err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta review?')) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar la review')
      }
      
      setReviews(reviews.filter(review => review.id !== id))
    } catch (_err) {
              alert(_err instanceof Error ? _err.message : 'Error al eliminar la review')
    }
  }

  const getStarRating = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
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
            <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las reseñas de usuarios de las cafeterías
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Total: {reviews.length} reviews
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reviews</h3>
              <p className="mt-1 text-sm text-gray-500">
                Las reviews de los usuarios aparecerán aquí cuando se creen.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li key={review.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {review.coffeeShop.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {review.coffeeShop.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-yellow-400">
                            {getStarRating(review.rating)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 italic">
                            &quot;{review.comment}&quot;
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Por: {review.user.fullName}</span>
                        <span className="mx-2">•</span>
                        <span>{review.user.email}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
