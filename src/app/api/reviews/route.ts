import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews - Obtener todas las reviews
export async function GET(request: NextRequest) {
  console.log('GET /api/reviews called')
  
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('GET params:', { coffeeShopId, limit, offset })

    // Devolver reviews vacías por ahora
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
    console.error('GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Crear nueva review
export async function POST(request: NextRequest) {
  console.log('POST /api/reviews called')
  
  try {
    const body = await request.json()
    console.log('POST body received:', body)
    
    const { userId, coffeeShopId, rating, comment } = body

    // Validaciones básicas
    if (!userId || !coffeeShopId || !rating) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { success: false, error: 'userId, coffeeShopId y rating son requeridos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      console.log('Validation failed: invalid rating')
      return NextResponse.json(
        { success: false, error: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Crear review simulada
    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newReview = {
      id: reviewId,
      rating: parseInt(rating),
      comment: comment || null,
      createdAt: now,
      updatedAt: now,
      user: {
        id: userId,
        name: 'Usuario Anónimo',
        avatar: null
      },
      coffeeShop: {
        id: coffeeShopId,
        name: 'East Crema Coffee'
      }
    }

    console.log('Review created successfully:', reviewId)

    return NextResponse.json({
      success: true,
      data: newReview
    }, { status: 201 })

  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}