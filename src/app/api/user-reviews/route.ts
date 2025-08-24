import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user-reviews - Obtener todas las reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Query básica
    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (coffeeShopId) {
      query = query.eq('coffee_shop_id', coffeeShopId)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: `Database error: ${error.message}`
      }, { status: 500 })
    }

    // Formatear reviews para la app
    const formattedReviews = (reviews || []).map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      user: {
        id: review.user_id,
        name: 'Usuario Anónimo',
        avatar: null
      },
      coffeeShop: {
        id: review.coffee_shop_id,
        name: 'East Crema Coffee'
      }
    }))

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      pagination: {
        total: formattedReviews.length,
        limit,
        offset,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error.message}`
    }, { status: 500 })
  }
}

// POST /api/user-reviews - Crear nueva review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, coffeeShopId, rating, comment } = body

    // Validaciones
    if (!userId || !coffeeShopId || !rating) {
      return NextResponse.json({
        success: false,
        error: 'userId, coffeeShopId y rating son requeridos'
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'El rating debe estar entre 1 y 5'
      }, { status: 400 })
    }

    // Verificar duplicados
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('coffee_shop_id', coffeeShopId)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Ya has escrito una review para esta cafetería'
      }, { status: 409 })
    }

    // Crear review
    const { data: newReview, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: userId,
        coffee_shop_id: coffeeShopId,
        rating: parseInt(rating),
        comment: comment || null
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({
        success: false,
        error: `Database error: ${error.message}`
      }, { status: 500 })
    }

    // Actualizar rating de la cafetería
    await updateCoffeeShopRating(coffeeShopId)

    return NextResponse.json({
      success: true,
      data: {
        id: newReview.id,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.created_at,
        updatedAt: newReview.updated_at,
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
    }, { status: 201 })

  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error.message}`
    }, { status: 500 })
  }
}

// Función helper para actualizar rating
async function updateCoffeeShopRating(coffeeShopId: string) {
  try {
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('coffee_shop_id', coffeeShopId)

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await supabaseAdmin
        .from('CoffeeShop')
        .update({
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        })
        .eq('id', coffeeShopId)
    }
  } catch (error) {
    console.error('Error updating rating:', error)
  }
}
