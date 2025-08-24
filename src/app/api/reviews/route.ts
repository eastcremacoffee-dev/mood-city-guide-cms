import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews - Obtener todas las reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('GET reviews:', { coffeeShopId, userId, limit, offset })

    // Construir la query
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        updated_at,
        user_id,
        coffee_shop_id
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtros opcionales
    if (coffeeShopId) {
      query = query.eq('coffee_shop_id', coffeeShopId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: reviews, error: reviewsError } = await query

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    // Obtener información de usuarios para cada review
    const reviewsWithUsers = await Promise.all(
      (reviews || []).map(async (review) => {
        // Obtener datos del usuario
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, name, avatar')
          .eq('id', review.user_id)
          .single()

        // Obtener datos de la cafetería
        const { data: coffeeShop } = await supabaseAdmin
          .from('CoffeeShop')
          .select('id, name')
          .eq('id', review.coffee_shop_id)
          .single()

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          user: {
            id: user?.id || review.user_id,
            name: user?.name || 'Usuario Anónimo',
            avatar: user?.avatar || null
          },
          coffeeShop: {
            id: coffeeShop?.id || review.coffee_shop_id,
            name: coffeeShop?.name || 'Cafetería'
          }
        }
      })
    )

    // Contar total de reviews
    let countQuery = supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    if (coffeeShopId) {
      countQuery = countQuery.eq('coffee_shop_id', coffeeShopId)
    }
    if (userId) {
      countQuery = countQuery.eq('user_id', userId)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      success: true,
      data: reviewsWithUsers,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0)
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
  try {
    const body = await request.json()
    console.log('POST review:', body)
    
    const { userId, coffeeShopId, rating, comment } = body

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
      .select('id, name')
      .eq('id', coffeeShopId)
      .single()

    if (coffeeShopError) {
      console.error('Coffee shop not found:', coffeeShopError)
      return NextResponse.json(
        { success: false, error: 'Cafetería no encontrada' },
        { status: 404 }
      )
    }

    // Crear o actualizar usuario
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Crear usuario si no existe
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          name: 'Usuario Anónimo'
        })

      if (userError) {
        console.error('Error creating user:', userError)
        // Continuar aunque no se pueda crear el usuario
      }
    }

    // Verificar si ya existe una review del usuario para esta cafetería
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('coffee_shop_id', coffeeShopId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Ya has escrito una review para esta cafetería' },
        { status: 409 }
      )
    }

    // Crear la review
    const { data: newReview, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: userId,
        coffee_shop_id: coffeeShopId,
        rating: parseInt(rating),
        comment: comment || null
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { success: false, error: 'Error al crear la review' },
        { status: 500 }
      )
    }

    // Actualizar el rating promedio de la cafetería
    await updateCoffeeShopRating(coffeeShopId)

    // Preparar la respuesta
    const reviewResponse = {
      id: newReview.id,
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: newReview.created_at,
      updatedAt: newReview.updated_at,
      user: {
        id: userId,
        name: existingUser?.name || 'Usuario Anónimo',
        avatar: null
      },
      coffeeShop: {
        id: coffeeShop.id,
        name: coffeeShop.name
      }
    }

    console.log('Review created successfully:', newReview.id)

    return NextResponse.json({
      success: true,
      data: reviewResponse
    }, { status: 201 })

  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para actualizar el rating promedio de una cafetería
async function updateCoffeeShopRating(coffeeShopId: string) {
  try {
    // Obtener todas las reviews de esta cafetería
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('coffee_shop_id', coffeeShopId)

    if (error) {
      console.error('Error fetching reviews for rating update:', error)
      return
    }

    if (reviews && reviews.length > 0) {
      // Calcular rating promedio
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length
      const reviewCount = reviews.length

      // Actualizar la cafetería
      const { error: updateError } = await supabaseAdmin
        .from('CoffeeShop')
        .update({
          rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
          reviewCount: reviewCount
        })
        .eq('id', coffeeShopId)

      if (updateError) {
        console.error('Error updating coffee shop rating:', updateError)
      } else {
        console.log(`Updated rating for ${coffeeShopId}: ${averageRating.toFixed(1)} (${reviewCount} reviews)`)
      }
    }
  } catch (error) {
    console.error('Error in updateCoffeeShopRating:', error)
  }
}