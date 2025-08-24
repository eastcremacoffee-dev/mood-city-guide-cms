import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews - Obtener todas las reviews (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir la query para Supabase
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        updated_at,
        user:users!reviews_user_id_fkey (
          id,
          name,
          avatar
        ),
        coffee_shop:coffee_shops!reviews_coffee_shop_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (coffeeShopId) {
      query = query.eq('coffee_shop_id', coffeeShopId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: reviews, error: reviewsError, count } = await query

    if (reviewsError) {
      console.error('Supabase error fetching reviews:', reviewsError)
      throw reviewsError
    }

    // Obtener el total count
    let countQuery = supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    if (coffeeShopId) {
      countQuery = countQuery.eq('coffee_shop_id', coffeeShopId)
    }

    if (userId) {
      countQuery = countQuery.eq('user_id', userId)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Supabase error counting reviews:', countError)
      throw countError
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
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

    // Verificar que el usuario existe (o crearlo si no existe)
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, avatar')
      .eq('id', userId)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // Usuario no existe, crearlo
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          name: 'Usuario Anónimo',
          role: 'USER'
        })
        .select('id, name, avatar')
        .single()

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        return NextResponse.json(
          { success: false, error: 'Error al crear usuario' },
          { status: 500 }
        )
      }

      user = newUser
    } else if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { success: false, error: 'Error al verificar usuario' },
        { status: 500 }
      )
    }

    // Verificar que la cafetería existe
    const { data: coffeeShop, error: coffeeShopError } = await supabaseAdmin
      .from('coffee_shops')
      .select('id, name')
      .eq('id', coffeeShopId)
      .single()

    if (coffeeShopError) {
      console.error('Error fetching coffee shop:', coffeeShopError)
      return NextResponse.json(
        { success: false, error: 'Cafetería no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe una review del usuario para esta cafetería
    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
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
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: userId,
        coffee_shop_id: coffeeShopId,
        rating,
        comment: comment || null
      })
      .select(`
        id,
        rating,
        comment,
        created_at,
        updated_at,
        user:users!reviews_user_id_fkey (
          id,
          name,
          avatar
        ),
        coffee_shop:coffee_shops!reviews_coffee_shop_id_fkey (
          id,
          name
        )
      `)
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

    return NextResponse.json({
      success: true,
      data: review
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para actualizar el rating promedio de una cafetería
async function updateCoffeeShopRating(coffeeShopId: string) {
  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('coffee_shop_id', coffeeShopId)

  if (reviewsError) {
    console.error('Error fetching reviews for rating update:', reviewsError)
    return
  }

  if (reviews && reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const reviewCount = reviews.length

    const { error: updateError } = await supabaseAdmin
      .from('coffee_shops')
      .update({
        rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        review_count: reviewCount
      })
      .eq('id', coffeeShopId)

    if (updateError) {
      console.error('Error updating coffee shop rating:', updateError)
    }
  }
}
