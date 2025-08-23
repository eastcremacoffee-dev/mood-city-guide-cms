import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/favorites/remove - Eliminar favorito por userId y coffeeShopId
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, coffeeShopId } = body

    if (!userId || !coffeeShopId) {
      return NextResponse.json(
        { success: false, error: 'userId y coffeeShopId son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el favorito
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_coffeeShopId: {
          userId,
          coffeeShopId
        }
      }
    })

    if (!favorite) {
      return NextResponse.json(
        { success: false, error: 'Favorito no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el favorito
    await prisma.userFavorite.delete({
      where: {
        userId_coffeeShopId: {
          userId,
          coffeeShopId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Favorito eliminado correctamente'
    })

  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
