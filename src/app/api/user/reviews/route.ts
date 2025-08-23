import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, createAuthResponse } from '@/lib/auth'

// GET - Obtener reviews del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return createAuthResponse()
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        coffeeShop: {
          select: {
            id: true,
            name: true,
            address: true,
            city: {
              select: {
                name: true
              }
            },
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.review.count({
      where: { userId: user.id }
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
    console.error('❌ Error obteniendo reviews del usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva review (usuario autenticado)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return createAuthResponse()
    }

    const body = await request.json()
    const { coffeeShopId, rating, comment } = body

    // Validaciones
    if (!coffeeShopId || !rating) {
      return NextResponse.json(
        { success: false, error: 'coffeeShopId y rating son requeridos' },
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
          userId: user.id,
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
        userId: user.id,
        coffeeShopId,
        rating,
        comment: comment || null
      },
      include: {
        coffeeShop: {
          select: {
            id: true,
            name: true,
            address: true,
            city: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Actualizar el rating promedio de la cafetería
    await updateCoffeeShopRating(coffeeShopId)

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creando review:', error)
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
