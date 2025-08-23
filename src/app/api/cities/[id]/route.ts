import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cities/[id] - Obtener ciudad por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coffeeShops: {
              where: {
                isActive: true
              }
            }
          }
        },
        coffeeShops: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            priceRange: true,
            hasWifi: true,
            hasOutdoor: true,
            hasPower: true,
            isQuiet: true,
            createdAt: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    const cityWithStats = {
      id: city.id,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      description: city.description,
      image: city.image,
      isActive: city.isActive,
      coffeeShopCount: city._count.coffeeShops,
      coffeeShops: city.coffeeShops,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: cityWithStats
    })

  } catch (error) {
    console.error('Error fetching city:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
