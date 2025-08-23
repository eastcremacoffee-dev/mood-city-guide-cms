import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockCities } from '@/lib/mock-data'

// GET /api/cities - Obtener todas las ciudades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Intentar usar la base de datos, si falla usar datos mock
    try {
      const whereClause: Record<string, unknown> = {
        isActive: true
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
            country: {
              contains: search
            }
          }
        ]
      }

      const cities = await prisma.city.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              coffeeShops: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: [
          { name: 'asc' }
        ]
      })

      const citiesWithStats = cities.map(city => ({
        id: city.id,
        name: city.name,
        description: city.description,
        imageUrl: city.imageUrl,
        country: city.country,
        isActive: city.isActive,
        coffeeShopsCount: city._count.coffeeShops,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }))

      return NextResponse.json({
        success: true,
        data: citiesWithStats,
        count: citiesWithStats.length
      })
    } catch (dbError) {
      console.log('Database error, using mock data:', dbError)
      
      // Usar datos mock si la base de datos falla
      let filteredCities = mockCities
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredCities = mockCities.filter(city => 
          city.name.toLowerCase().includes(searchLower) ||
          city.description.toLowerCase().includes(searchLower)
        )
      }

      const citiesWithStats = filteredCities.map(city => ({
        id: city.id,
        name: city.name,
        description: city.description,
        imageUrl: city.imageUrl,
        country: 'España',
        isActive: true,
        coffeeShopsCount: 1, // Mock count
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }))

      return NextResponse.json({
        success: true,
        data: citiesWithStats,
        count: citiesWithStats.length,
        source: 'mock'
      })
    }
  } catch (error) {
    console.error('Error in cities API:', error)
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

// POST /api/cities - Crear nueva ciudad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, country } = body

    // Validar datos requeridos
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      )
    }

    try {
      const city = await prisma.city.create({
        data: {
          name,
          description,
          imageUrl: imageUrl || null,
          country: country || 'España',
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        data: city
      }, { status: 201 })
    } catch (dbError) {
      console.log('Database error in POST, returning mock response:', dbError)
      
      // Retornar respuesta mock si la base de datos falla
      const mockCity = {
        id: Date.now().toString(),
        name,
        description,
        imageUrl: imageUrl || null,
        country: country || 'España',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({
        success: true,
        data: mockCity,
        source: 'mock'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating city:', error)
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