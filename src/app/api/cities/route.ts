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

// DELETE /api/cities - Eliminar ciudad
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('id')

    if (!cityId) {
      return NextResponse.json(
        { success: false, error: 'ID de ciudad requerido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Eliminando ciudad: ${cityId}`)

    // Verificar si la ciudad existe
    const { data: existingCity, error: fetchError } = await supabase
      .from('City')
      .select('id, name')
      .eq('id', cityId)
      .single()

    if (fetchError || !existingCity) {
      return NextResponse.json(
        { success: false, error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay cafeterías asociadas
    const { count: coffeeShopsCount, error: countError } = await supabase
      .from('CoffeeShop')
      .select('*', { count: 'exact', head: true })
      .eq('cityId', cityId)

    if (countError) {
      console.error('Error checking coffee shops:', countError)
      return NextResponse.json(
        { success: false, error: 'Error al verificar cafeterías asociadas' },
        { status: 500 }
      )
    }

    // Si hay cafeterías asociadas, no permitir eliminar
    if (coffeeShopsCount && coffeeShopsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede eliminar la ciudad "${existingCity.name}" porque tiene ${coffeeShopsCount} cafeterías asociadas. Elimina primero las cafeterías.`
        },
        { status: 400 }
      )
    }

    // Eliminar la ciudad
    const { error: deleteError } = await supabase
      .from('City')
      .delete()
      .eq('id', cityId)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al eliminar ciudad',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    console.log(`✅ Ciudad eliminada exitosamente: ${existingCity.name}`)

    return NextResponse.json({
      success: true,
      message: `Ciudad "${existingCity.name}" eliminada exitosamente`
    })

  } catch (error) {
    console.error('Error deleting city:', error)
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