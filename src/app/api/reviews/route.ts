import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews - Obtener todas las reviews (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!coffeeShopId) {
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
    }

    // Por ahora, simular reviews vacías hasta que se agregue la columna
    const reviews = []
    const paginatedReviews = reviews.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedReviews,
      pagination: {
        total: reviews.length,
        limit,
        offset,
        hasMore: offset + limit < reviews.length
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

    // Validaciones
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

    // Verificar que la cafetería existe
    const { data: coffeeShop, error: coffeeShopError } = await supabaseAdmin
      .from('CoffeeShop')
      .select('id, name, rating, reviewCount')
      .eq('id', coffeeShopId)
      .single()

    if (coffeeShopError) {
      console.error('Error fetching coffee shop:', coffeeShopError)
      return NextResponse.json(
        { success: false, error: 'Cafetería no encontrada' },
        { status: 404 }
      )
    }

    // Por ahora, simular que se guarda la review exitosamente
    // TODO: Implementar almacenamiento real cuando se agregue la columna reviews
    
    // Crear la nueva review (simulada)
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
      }
    }

    // Simular actualización del rating (por ahora solo incrementar reviewCount)
    const currentReviewCount = coffeeShop.reviewCount || 0
    const currentRating = coffeeShop.rating || 0
    
    // Calcular nuevo rating promedio (simulado)
    const totalRating = (currentRating * currentReviewCount) + rating
    const newReviewCount = currentReviewCount + 1
    const averageRating = totalRating / newReviewCount

    // Actualizar solo el rating y reviewCount
    const { error: updateError } = await supabaseAdmin
      .from('CoffeeShop')
      .update({
        rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        reviewCount: newReviewCount
      })
      .eq('id', coffeeShopId)

    if (updateError) {
      console.error('Error updating coffee shop rating:', updateError)
      // No fallar por esto, solo loggearlo
    }

    // Preparar la respuesta con la estructura esperada
    const reviewResponse = {
      ...newReview,
      coffee_shop: {
        id: coffeeShop.id,
        name: coffeeShop.name
      }
    }

    return NextResponse.json({
      success: true,
      data: reviewResponse
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}