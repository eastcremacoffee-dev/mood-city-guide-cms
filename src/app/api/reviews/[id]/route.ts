import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reviews/[id] - Obtener review por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review
    })

  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Actualizar review
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { rating, comment, userId } = body

    // Verificar que la review existe
    const existingReview = await prisma.review.findUnique({
      where: { id }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario de la review
    if (userId && existingReview.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para editar esta review' },
        { status: 403 }
      )
    }

    // Validar rating si se proporciona
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Actualizar la review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment })
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

    // Actualizar el rating promedio de la cafetería si cambió el rating
    if (rating) {
      await updateCoffeeShopRating(existingReview.coffeeShopId)
    }

    return NextResponse.json({
      success: true,
      data: updatedReview
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Eliminar review
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verificar que la review existe
    const existingReview = await prisma.review.findUnique({
      where: { id }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario de la review
    if (userId && existingReview.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar esta review' },
        { status: 403 }
      )
    }

    // Eliminar la review
    await prisma.review.delete({
      where: { id }
    })

    // Actualizar el rating promedio de la cafetería
    await updateCoffeeShopRating(existingReview.coffeeShopId)

    return NextResponse.json({
      success: true,
      message: 'Review eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
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
  } else {
    // Si no hay reviews, resetear a 0
    await prisma.coffeeShop.update({
      where: { id: coffeeShopId },
      data: {
        rating: 0,
        reviewCount: 0
      }
    })
  }
}
