'use client'

import { useState, useEffect } from 'react'
import { getAllStoredImages } from '@/lib/imageStorage'

interface ImageStatusWidgetProps {
  coffeeShops: Array<{id: string, name: string}>
}

export default function ImageStatusWidget({ coffeeShops }: ImageStatusWidgetProps) {
  const [imageStats, setImageStats] = useState({
    totalShops: 0,
    shopsWithImages: 0,
    shopsWithoutImages: 0
  })

  useEffect(() => {
    const storedImages = getAllStoredImages()
    const shopsWithImages = coffeeShops.filter(shop => 
      storedImages.some(img => img.coffeeShopId === shop.id)
    )

    setImageStats({
      totalShops: coffeeShops.length,
      shopsWithImages: shopsWithImages.length,
      shopsWithoutImages: coffeeShops.length - shopsWithImages.length
    })
  }, [coffeeShops])

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Imágenes Reales</p>
          <p className="text-2xl font-bold text-gray-900">
            {imageStats.shopsWithImages}/{imageStats.totalShops}
          </p>
          <p className="text-xs text-gray-500">
            {imageStats.shopsWithoutImages} sin imagen
          </p>
        </div>
      </div>
    </div>
  )
}
