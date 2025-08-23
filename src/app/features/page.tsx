'use client'

import { useState, useEffect } from 'react'
import { FeatureCategory } from '@prisma/client'
import AdminLayout from '../../components/AdminLayout'

interface Feature {
  id: string
  name: string
  iconName: string
  category: FeatureCategory
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface GroupedFeatures {
  [key: string]: Feature[]
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<GroupedFeatures>({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)

  const categoryNames = {
    COFFEE: 'Coffee',
    FOOD_DRINKS: 'Food & Drinks',
    MORE: 'More'
  }

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features')
      const data = await response.json()
      if (data.success) {
        setFeatures(data.data)
      }
    } catch (error) {
      console.error('Error fetching features:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  const handleToggleActive = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/features/${feature.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !feature.isActive
        })
      })

      if (response.ok) {
        fetchFeatures()
      }
    } catch (error) {
      console.error('Error updating feature:', error)
    }
  }

  const handleDeleteFeature = async (feature: Feature) => {
    if (feature.usageCount > 0) {
      alert(`No se puede eliminar la feature "${feature.name}" porque está siendo usada por ${feature.usageCount} cafeterías.`)
      return
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la feature "${feature.name}"?`)) {
      try {
        const response = await fetch(`/api/features/${feature.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchFeatures()
        }
      } catch (error) {
        console.error('Error deleting feature:', error)
      }
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Features</h1>
            <p className="text-gray-600">Gestiona las características disponibles para las cafeterías</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Feature</span>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(categoryNames).map(([categoryKey, categoryName]) => {
            const categoryFeatures = features[categoryKey] || []
            
            return (
              <div key={categoryKey} className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoryName} ({categoryFeatures.length})
                  </h2>
                </div>
              
              <div className="p-6">
                {categoryFeatures.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay features en esta categoría
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          feature.isActive
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="font-medium text-gray-900">
                              {feature.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleToggleActive(feature)}
                              className={`w-8 h-4 rounded-full transition-colors ${
                                feature.isActive ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                  feature.isActive ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div>Icono: {feature.iconName}</div>
                          <div>Usado en: {feature.usageCount} cafeterías</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            feature.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {feature.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingFeature(feature)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteFeature(feature)}
                              className={`text-sm ${
                                feature.usageCount > 0
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-800'
                              }`}
                              disabled={feature.usageCount > 0}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de crear/editar feature */}
      {(showCreateModal || editingFeature) && (
        <FeatureModal
          feature={editingFeature}
          onClose={() => {
            setShowCreateModal(false)
            setEditingFeature(null)
          }}
          onSave={() => {
            fetchFeatures()
            setShowCreateModal(false)
            setEditingFeature(null)
          }}
        />
      )}
      </div>
    </AdminLayout>
  )
}

interface FeatureModalProps {
  feature?: Feature | null
  onClose: () => void
  onSave: () => void
}

function FeatureModal({ feature, onClose, onSave }: FeatureModalProps) {
  const [formData, setFormData] = useState({
    name: feature?.name || '',
    iconName: feature?.iconName || '',
    category: feature?.category || 'COFFEE' as FeatureCategory,
    isActive: feature?.isActive ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = feature ? `/api/features/${feature.id}` : '/api/features'
      const method = feature ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar la feature')
      }
    } catch (error) {
      console.error('Error saving feature:', error)
      alert('Error al guardar la feature')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {feature ? 'Editar Feature' : 'Nueva Feature'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icono (SF Symbol)
            </label>
            <input
              type="text"
              value={formData.iconName}
              onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cup.and.saucer.fill"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as FeatureCategory })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="COFFEE">Coffee</option>
              <option value="FOOD_DRINKS">Food & Drinks</option>
              <option value="MORE">More</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Feature activa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
