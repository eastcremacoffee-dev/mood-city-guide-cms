import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { geocodeCity } from '@/lib/cityGeocoding'

// GET /api/cities - Obtener todas las ciudades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('City')
      .select('*')
      .order('name', { ascending: true })

    // Filtrar por búsqueda si se especifica
    if (search) {
      query = query.or(`name.ilike.%${search}%,country.ilike.%${search}%`)
    }

    const { data: cities, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener ciudades',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Obtener conteo de cafeterías para cada ciudad
    const citiesWithStats = await Promise.all(
      (cities || []).map(async (city) => {
        const { count } = await supabase
          .from('CoffeeShop')
          .select('*', { count: 'exact', head: true })
          .eq('cityId', city.id)

        return {
          id: city.id,
          name: city.name,
          description: city.description,
          image: city.imageUrl, // Usar 'imageUrl' que es el campo real en tu DB
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
          coffeeShopCount: count || 0, // Usar 'coffeeShopCount' para consistencia con frontend
          createdAt: city.createdAt,
          updatedAt: city.updatedAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: citiesWithStats,
      count: citiesWithStats.length
    })
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
    const { name, description, image, country } = body

    // Validar datos requeridos
    if (!name || !description || !country) {
      return NextResponse.json(
        { success: false, error: 'Nombre, descripción y país son requeridos' },
        { status: 400 }
      )
    }

    console.log(`🌍 Iniciando geocoding para ciudad: ${name}, ${country}`)

    // Obtener coordenadas automáticamente
    let coordinates
    try {
      coordinates = await geocodeCity(name, country)
    } catch (geocodingError) {
      console.error('Error en geocoding:', geocodingError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudieron obtener las coordenadas de la ciudad. Verifica que el nombre y país sean correctos.',
          details: geocodingError instanceof Error ? geocodingError.message : 'Error desconocido'
        },
        { status: 400 }
      )
    }

    // Crear ID único basado en el nombre (slug)
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const { data: city, error } = await supabase
      .from('City')
      .insert([
        {
          id,
          name,
          description,
          imageUrl: image || null,
          country,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          isActive: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear ciudad',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: city
    }, { status: 201 })
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