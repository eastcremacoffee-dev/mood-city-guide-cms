import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews - Obtener todas las reviews (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Por ahora, devolver reviews vacías
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Crear nueva review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, coffeeShopId, rating, comment } = body

    console.log('Creating review:', { userId, coffeeShopId, rating, comment })

    // Validaciones básicas
    if (!userId || !coffeeShopId || !rating) {
      return NextResponse.json(
        { success: false, error: 'userId, coffeeShopId y rating son requeridos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Simular creación exitosa de review
    const newReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      rating,
      comment: comment || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: userId,
        name: 'Usuario Anónimo',
        avatar: null
      },
      coffee_shop: {
        id: coffeeShopId,
        name: 'East Crema Coffee Hermosilla'
      }
    }

    console.log('Review created successfully:', newReview.id)

    return NextResponse.json({
      success: true,
      data: newReview
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}