import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/favorites - Obtener favoritos de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        coffeeShop: {
          include: {
            city: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: favorites
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Agregar cafetería a favoritos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, coffeeShopId } = body

    // Validaciones
    if (!userId || !coffeeShopId) {
      return NextResponse.json(
        { success: false, error: 'userId y coffeeShopId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
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

    // Verificar si ya está en favoritos
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_coffeeShopId: {
          userId,
          coffeeShopId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'La cafetería ya está en favoritos' },
        { status: 409 }
      )
    }

    // Crear el favorito
    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        coffeeShopId
      },
      include: {
        coffeeShop: {
          include: {
            city: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: favorite
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
