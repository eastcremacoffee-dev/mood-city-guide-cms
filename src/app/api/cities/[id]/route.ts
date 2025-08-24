import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { geocodeCity } from '@/lib/cityGeocoding'

// GET /api/cities/[id] - Obtener ciudad por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Obtener ciudad
    const { data: city, error: cityError } = await supabase
      .from('City')
      .select('*')
      .eq('id', id)
      .single()

    if (cityError || !city) {
      return NextResponse.json(
        { success: false, error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Obtener cafeterías de la ciudad
    const { data: coffeeShops, error: coffeeShopsError } = await supabase
      .from('CoffeeShop')
      .select(`
        id,
        name,
        address,
        phone,
        website,
        rating,
        "reviewCount",
        "priceRange",
        "isActive",
        "createdAt"
      `)
      .eq('cityId', id)
      .order('name', { ascending: true })

    if (coffeeShopsError) {
      console.error('Error fetching coffee shops:', coffeeShopsError)
    }

    const cityWithStats = {
      id: city.id,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      description: city.description,
              image: city.imageUrl,
      isActive: city.isActive,
      coffeeShopCount: coffeeShops?.length || 0,
      coffeeShops: coffeeShops || [],
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

// PUT /api/cities/[id] - Actualizar ciudad
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, description, image, country, isActive } = body

    // Validar datos requeridos
    if (!name || !description || !country) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre, descripción y país son requeridos',
          received: { name, description, country }
        },
        { status: 400 }
      )
    }

    console.log(`🌍 Iniciando geocoding para actualización de ciudad: ${name}, ${country}`)

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

    const { data: city, error } = await supabase
      .from('City')
      .update({
        name,
        description,
        imageUrl: image || null,
        country,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al actualizar ciudad',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: city
    })
  } catch (error) {
    console.error('Error updating city:', error)
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
