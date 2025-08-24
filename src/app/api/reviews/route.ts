import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews - Obtener todas las reviews
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/reviews called')
    
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    
    console.log('coffeeShopId:', coffeeShopId)

    // Query simple para debuggear
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .limit(10)

    console.log('Reviews query result:', { reviews, error })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: reviews || [],
      message: 'Reviews fetched successfully'
    })

  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error.message}`,
      stack: error.stack
    }, { status: 500 })
  }
}

// POST /api/reviews - Crear nueva review (versión simplificada para debug)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/reviews called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, coffeeShopId, rating, comment } = body

    // Validaciones básicas
    if (!userId || !coffeeShopId || !rating) {
      console.log('Validation failed')
      return NextResponse.json({
        success: false,
        error: 'userId, coffeeShopId y rating son requeridos'
      }, { status: 400 })
    }

    console.log('Validation passed, creating review...')

    // Crear la review directamente
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

    console.log('Insert result:', { newReview, error })

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({
        success: false,
        error: `Database insert error: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    console.log('Review created successfully:', newReview.id)

    return NextResponse.json({
      success: true,
      data: {
        id: newReview.id,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.created_at,
        user: {
          id: userId,
          name: 'Usuario Anónimo',
          avatar: null
        },
        coffeeShop: {
          id: coffeeShopId,
          name: 'East Crema Coffee'
        }
      },
      message: 'Review created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error.message}`,
      stack: error.stack
    }, { status: 500 })
  }
}