'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

interface Proposal {
  id: string
  name: string
  description?: string
  address: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  opening_hours?: any
  features?: string[]
  price_range: string
  submitted_by_user_id?: string
  submitted_by_name?: string
  submitted_by_email?: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'converted_to_official'
  admin_notes?: string
  image_urls?: string[]
  created_at: string
  updated_at: string
  reviewed_at?: string
  reviewed_by?: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  in_review: 'bg-blue-100 text-blue-800',
  converted_to_official: 'bg-purple-100 text-purple-800'
}

const statusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  in_review: 'En Revisión',
  converted_to_official: 'Convertida'
}

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    fetchProposal()
  }, [params.id])

  const fetchProposal = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/proposals/${params.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error cargando propuesta')
      }

      setProposal(result.data)
      setAdminNotes(result.data.admin_notes || '')
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando propuesta:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProposalStatus = async (status: string, notes?: string) => {
    if (!proposal) return

    const confirmMessage = {
      approved: '¿Aprobar esta propuesta?',
      rejected: '¿Rechazar esta propuesta?',
      in_review: '¿Marcar como en revisión?',
      pending: '¿Marcar como pendiente?'
    }[status]

    if (!confirm(confirmMessage)) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_notes: notes || adminNotes,
          reviewed_by: 'admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error actualizando propuesta')
      }

      setProposal(result.data)
      alert('Propuesta actualizada exitosamente')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const convertToOfficial = async () => {
    if (!proposal || proposal.status !== 'approved') {
      alert('Solo se pueden convertir propuestas aprobadas')
      return
    }

    if (!confirm('¿Convertir esta propuesta a cafetería oficial? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setConverting(true)
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error convirtiendo propuesta')
      }

      alert('Propuesta convertida a cafetería oficial exitosamente')
      fetchProposal() // Recargar datos
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setConverting(false)
    }
  }

  const saveAdminNotes = async () => {
    if (!proposal) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_notes: adminNotes
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error guardando notas')
      }

      setProposal(result.data)
      alert('Notas guardadas exitosamente')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !proposal) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error || 'Propuesta no encontrada'}</p>
          <button
            onClick={() => router.push('/admin/proposals')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            ← Volver a propuestas
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/proposals')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proposal.name}</h1>
              <p className="text-gray-600">Propuesta de cafetería</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[proposal.status]}`}>
              {statusLabels[proposal.status]}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {proposal.status !== 'approved' && (
            <button
              onClick={() => updateProposalStatus('approved')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Procesando...' : 'Aprobar'}
            </button>
          )}
          
          {proposal.status !== 'rejected' && (
            <button
              onClick={() => updateProposalStatus('rejected')}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {updating ? 'Procesando...' : 'Rechazar'}
            </button>
          )}
          
          {proposal.status !== 'in_review' && (
            <button
              onClick={() => updateProposalStatus('in_review')}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Procesando...' : 'Marcar en Revisión'}
            </button>
          )}

          {proposal.status === 'approved' && proposal.status !== 'converted_to_official' && (
            <button
              onClick={convertToOfficial}
              disabled={converting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {converting ? 'Convirtiendo...' : 'Convertir a Oficial'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="mt-1 text-sm text-gray-900">{proposal.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <p className="mt-1 text-sm text-gray-900">{proposal.city}, {proposal.country}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <p className="mt-1 text-sm text-gray-900">{proposal.address}</p>
                </div>
                {proposal.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">{proposal.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposal.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="mt-1 text-sm text-gray-900">{proposal.phone}</p>
                  </div>
                )}
                {proposal.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{proposal.email}</p>
                  </div>
                )}
                {proposal.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                    <a href={proposal.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                      {proposal.website}
                    </a>
                  </div>
                )}
                {proposal.instagram && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <p className="mt-1 text-sm text-gray-900">{proposal.instagram}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features and Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Características</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rango de Precios</label>
                  <p className="mt-1 text-sm text-gray-900">{proposal.price_range}</p>
                </div>
                {proposal.features && proposal.features.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Servicios</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {proposal.features.map((feature, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {proposal.opening_hours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Horarios</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(proposal.opening_hours, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            {proposal.image_urls && proposal.image_urls.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {proposal.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Envío</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enviado por</label>
                  <p className="mt-1 text-sm text-gray-900">{proposal.submitted_by_name || 'Anónimo'}</p>
                </div>
                {proposal.submitted_by_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email del remitente</label>
                    <p className="mt-1 text-sm text-gray-900">{proposal.submitted_by_email}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de envío</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(proposal.created_at).toLocaleString()}</p>
                </div>
                {proposal.reviewed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de revisión</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(proposal.reviewed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {(proposal.latitude && proposal.longitude) && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Lat: {proposal.latitude}</p>
                  <p className="text-sm text-gray-600">Lng: {proposal.longitude}</p>
                  <a
                    href={`https://maps.google.com/?q=${proposal.latitude},${proposal.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver en Google Maps
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notas del Administrador</h3>
              <div className="space-y-3">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Añadir notas sobre esta propuesta..."
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {updating ? 'Guardando...' : 'Guardar Notas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
