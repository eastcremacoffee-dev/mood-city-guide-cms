import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, createAuthResponse } from '@/lib/auth'

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return createAuthResponse()
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        coffeeShop: {
          include: {
            city: true,
            images: true,
            features: {
              include: {
                feature: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: favorites.map(fav => ({
        id: fav.id,
        createdAt: fav.createdAt,
        coffeeShop: {
          id: fav.coffeeShop.id,
          name: fav.coffeeShop.name,
          description: fav.coffeeShop.description,
          address: fav.coffeeShop.address,
          latitude: fav.coffeeShop.latitude,
          longitude: fav.coffeeShop.longitude,
          phone: fav.coffeeShop.phone,
          website: fav.coffeeShop.website,
          instagram: fav.coffeeShop.instagram,
          rating: fav.coffeeShop.rating,
          reviewCount: fav.coffeeShop.reviewCount,
          priceRange: fav.coffeeShop.priceRange,
          city: fav.coffeeShop.city,
          images: fav.coffeeShop.images,
          features: fav.coffeeShop.features.map(cf => cf.feature)
        }
      }))
    })

  } catch (error) {
    console.error('❌ Error obteniendo favoritos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Agregar/quitar favorito
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return createAuthResponse()
    }

    const body = await request.json()
    const { coffeeShopId, action } = body // action: 'add' | 'remove'

    if (!coffeeShopId || !action) {
      return NextResponse.json(
        { success: false, error: 'coffeeShopId y action son requeridos' },
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

    if (action === 'add') {
      // Agregar a favoritos (si no existe ya)
      const existingFavorite = await prisma.userFavorite.findUnique({
        where: {
          userId_coffeeShopId: {
            userId: user.id,
            coffeeShopId
          }
        }
      })

      if (existingFavorite) {
        return NextResponse.json({
          success: true,
          message: 'Ya está en favoritos',
          data: { isFavorite: true }
        })
      }

      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          coffeeShopId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Agregado a favoritos',
        data: { isFavorite: true }
      })

    } else if (action === 'remove') {
      // Quitar de favoritos
      await prisma.userFavorite.deleteMany({
        where: {
          userId: user.id,
          coffeeShopId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Quitado de favoritos',
        data: { isFavorite: false }
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Action debe ser "add" o "remove"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error gestionando favorito:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
