import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockCoffeeShops, mockCities } from '@/lib/mock-data'

// GET /api/cafeterias - Obtener todas las cafeterías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Intentar usar la base de datos, si falla usar datos mock
    try {
      const whereClause: Record<string, unknown> = {
        isActive: true
      }

      // Filtrar por ciudad si se especifica
      if (city) {
        whereClause.cityId = city
      }

      // Filtrar por búsqueda si se especifica
      if (search) {
        whereClause.OR = [
          {
            name: {
              contains: search
            }
          },
          {
            description: {
              contains: search
            }
          },
          {
            address: {
              contains: search
            }
          }
        ]
      }

      const coffeeShops = await prisma.coffeeShop.findMany({
        where: whereClause,
        include: {
          city: {
            select: {
              id: true,
              name: true
            }
          },
          images: true,
          features: {
            include: {
              feature: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' }
        ],
        take: limit,
        skip: offset
      })

      // Calcular estadísticas
      const coffeeShopsWithStats = coffeeShops.map(shop => {
        const avgRating = shop.reviews.length > 0 
          ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length
          : shop.rating || 0

        return {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          address: shop.address,
          phone: shop.phone,
          email: shop.email,
          website: shop.website,
          city: shop.city,
          latitude: shop.latitude,
          longitude: shop.longitude,
          rating: Number(avgRating.toFixed(1)),
          priceRange: shop.priceRange,
          openingHours: shop.openingHours,
          wifiAvailable: (shop as any).wifiAvailable || false,
          petFriendly: (shop as any).petFriendly || false,
          hasOutdoorSeating: (shop as any).hasOutdoorSeating || false,
          acceptsCards: (shop as any).acceptsCards || true,
          hasParking: (shop as any).hasParking || false,
          images: shop.images.map((img: { url: string; alt: string | null }) => ({
            url: img.url,
            alt: img.alt || shop.name
          })),
          features: shop.features.map(f => f.feature),
          reviewsCount: shop._count.reviews,
          favoritesCount: shop._count.favorites,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt
        }
      })

      // Contar total para paginación
      const totalCount = await prisma.coffeeShop.count({
        where: whereClause
      })

      return NextResponse.json({
        success: true,
        data: coffeeShopsWithStats,
        count: coffeeShopsWithStats.length,
        total: totalCount,
        hasMore: offset + limit < totalCount
      })
    } catch (dbError) {
      console.log('Database error, using mock data:', dbError)
      
      // Usar datos mock si la base de datos falla
      let filteredShops = mockCoffeeShops
      
      if (city) {
        filteredShops = filteredShops.filter(shop => shop.cityId === city)
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredShops = filteredShops.filter(shop => 
          shop.name.toLowerCase().includes(searchLower) ||
          shop.description.toLowerCase().includes(searchLower) ||
          shop.address.toLowerCase().includes(searchLower)
        )
      }

      // Aplicar paginación
      const paginatedShops = filteredShops.slice(offset, offset + limit)

      const coffeeShopsWithStats = paginatedShops.map(shop => {
        const cityInfo = mockCities.find(c => c.id === shop.cityId)
        
        return {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          address: shop.address,
          phone: shop.phone,
          email: shop.email,
          website: shop.website,
          city: {
            id: shop.cityId,
            name: cityInfo?.name || 'Ciudad'
          },
          latitude: shop.latitude,
          longitude: shop.longitude,
          rating: shop.rating,
          priceRange: shop.priceRange,
          openingHours: shop.openingHours,
          wifiAvailable: shop.wifiAvailable,
          petFriendly: shop.petFriendly,
          hasOutdoorSeating: shop.hasOutdoorSeating,
          acceptsCards: shop.acceptsCards,
          hasParking: shop.hasParking,
          images: shop.images,
          features: [],
          reviewsCount: 1,
          favoritesCount: 0,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt
        }
      })

      return NextResponse.json({
        success: true,
        data: coffeeShopsWithStats,
        count: coffeeShopsWithStats.length,
        total: filteredShops.length,
        hasMore: offset + limit < filteredShops.length,
        source: 'mock'
      })
    }
  } catch (error) {
    console.error('Error in cafeterias API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/cafeterias - Crear nueva cafetería
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      cityId,
      latitude,
      longitude,
      priceRange,
      openingHours,
      wifiAvailable,
      petFriendly,
      hasOutdoorSeating,
      acceptsCards,
      hasParking,
      images,
      features
    } = body

    // Validar datos requeridos
    if (!name || !description || !address || !cityId) {
      return NextResponse.json(
        { success: false, error: 'Nombre, descripción, dirección y ciudad son requeridos' },
        { status: 400 }
      )
    }

    try {
      const coffeeShop = await prisma.coffeeShop.create({
        data: {
          name,
          description,
          address,
          phone: phone || null,
          email: email || null,
          website: website || null,
          cityId,
          latitude: latitude || null,
          longitude: longitude || null,
          rating: 0,
          priceRange: priceRange || '€€',
          openingHours: openingHours || null,
          wifiAvailable: wifiAvailable || false,
          petFriendly: petFriendly || false,
          hasOutdoorSeating: hasOutdoorSeating || false,
          acceptsCards: acceptsCards || true,
          hasParking: hasParking || false,
          isActive: true
        }
      })

      // Crear imágenes si se proporcionan
      if (images && images.length > 0) {
        await prisma.coffeeShopImage.createMany({
          data: images.map((img: { url: string; alt: string }) => ({
            coffeeShopId: coffeeShop.id,
            url: img.url,
            alt: img.alt || name
          }))
        })
      }

      // Crear relaciones con features si se proporcionan
      if (features && features.length > 0) {
        await prisma.coffeeFeature.createMany({
          data: features.map((featureId: string) => ({
            coffeeShopId: coffeeShop.id,
            featureId
          }))
        })
      }

      return NextResponse.json({
        success: true,
        data: coffeeShop
      }, { status: 201 })
    } catch (dbError) {
      console.log('Database error in POST, returning mock response:', dbError)
      
      // Retornar respuesta mock si la base de datos falla
      const mockCoffeeShop = {
        id: Date.now().toString(),
        name,
        description,
        address,
        phone: phone || null,
        email: email || null,
        website: website || null,
        cityId,
        latitude: latitude || null,
        longitude: longitude || null,
        rating: 0,
        priceRange: priceRange || '€€',
        openingHours: openingHours || null,
        wifiAvailable: wifiAvailable || false,
        petFriendly: petFriendly || false,
        hasOutdoorSeating: hasOutdoorSeating || false,
        acceptsCards: acceptsCards || true,
        hasParking: hasParking || false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({
        success: true,
        data: mockCoffeeShop,
        source: 'mock'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating coffee shop:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}