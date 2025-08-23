import { NextRequest, NextResponse } from 'next/server'

// API para obtener las URLs de imágenes reales de localStorage
export async function GET(request: NextRequest) {
  try {
    // Simulamos las imágenes que están en localStorage del navegador
    // En producción, esto debería venir de una base de datos
    const imageMapping = {
      "caf-vercel-pro-test-1755972084216": "https://res.cloudinary.com/dk7ni1v89/image/upload/v1755982408/coffee-shops/qiyzepd9clarn78ac2vr.png",
      // Agregar más mapeos aquí cuando se suban más imágenes
    }

    return NextResponse.json({
      success: true,
      images: imageMapping
    })
  } catch (error) {
    console.error('Error getting images:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener imágenes' },
      { status: 500 }
    )
  }
}
