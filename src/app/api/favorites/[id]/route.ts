import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/favorites/[id] - Eliminar favorito
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verificar que el favorito existe
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: { id }
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Favorito no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario del favorito
    if (userId && existingFavorite.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar este favorito' },
        { status: 403 }
      )
    }

    // Eliminar el favorito
    await prisma.userFavorite.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Favorito eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites/remove - Eliminar favorito por userId y coffeeShopId
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

    // Buscar y eliminar el favorito
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
