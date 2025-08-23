import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reviews - Obtener todas las reviews (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: Record<string, unknown> = {}

    if (coffeeShopId) {
      whereClause.coffeeShopId = coffeeShopId
    }

    if (userId) {
      whereClause.userId = userId
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        coffeeShop: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.review.count({
      where: whereClause
    })

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

    // Verificar que el usuario y la cafetería existen
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: coffeeShopId }
    })

    if (!coffeeShop) {
      return NextResponse.json(
        { success: false, error: 'Cafetería no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe una review del usuario para esta cafetería
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_coffeeShopId: {
          userId,
          coffeeShopId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Ya has escrito una review para esta cafetería' },
        { status: 409 }
      )
    }

    // Crear la review
    const review = await prisma.review.create({
      data: {
        userId,
        coffeeShopId,
        rating,
        comment: comment || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        coffeeShop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

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
  const reviews = await prisma.review.findMany({
    where: { coffeeShopId },
    select: { rating: true }
  })

  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const reviewCount = reviews.length

    await prisma.coffeeShop.update({
      where: { id: coffeeShopId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        reviewCount
      }
    })
  }
}
