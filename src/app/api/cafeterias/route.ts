import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/cafeterias - Obtener todas las cafeterías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('CoffeeShop')
      .select(`
        *,
        city:City(*)
      `)
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true })

    // Filtrar por ciudad si se especifica
    if (city) {
      query = query.eq('cityId', city)
    }

    // Filtrar por búsqueda si se especifica
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data: coffeeShops, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener cafeterías',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coffeeShops || [],
      count: coffeeShops?.length || 0
    })
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
      cityId, 
      latitude, 
      longitude,
      phone,
      website,
      imageUrl,
      openingHours,
      priceRange,
      images
    } = body

    // Validar datos requeridos
    if (!name || !address || !cityId) {
      return NextResponse.json(
        { success: false, error: 'Nombre, dirección y ciudad son requeridos' },
        { status: 400 }
      )
    }

    // Crear ID único basado en el nombre
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    // Determinar la imagen principal
    let finalImageUrl = imageUrl
    if (!finalImageUrl && images && Array.isArray(images) && images.length > 0 && images[0].url) {
      finalImageUrl = images[0].url
    }

    // Preparar datos para insertar
    const insertData: any = {
      id,
      name,
      description: description || '',
      address,
      cityId
    }

    // Agregar campos opcionales si tienen valor
    if (finalImageUrl) insertData.imageUrl = finalImageUrl
    if (latitude && latitude !== '') insertData.latitude = parseFloat(latitude)
    if (longitude && longitude !== '') insertData.longitude = parseFloat(longitude)
    if (phone) insertData.phone = phone
    if (website) insertData.website = website
    if (openingHours) insertData.openingHours = openingHours
    if (priceRange) insertData.priceRange = priceRange

    const { data: coffeeShop, error } = await supabase
      .from('CoffeeShop')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear cafetería',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coffeeShop
    }, { status: 201 })
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

// PUT /api/cafeterias - Actualizar cafetería
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('PUT request body:', JSON.stringify(body, null, 2))
    const {
      id,
      name,
      description,
      address,
      latitude,
      longitude,
      phone,
      website,
      instagram,
      email,
      imageUrl,
      imageUrl2,
      imageUrl3,
      priceRange,
      cityId,
      isActive,
      images,
      openingHours,
      selectedFeatures
    } = body

    // Validar datos requeridos
    if (!id || !name || !address || !cityId) {
      return NextResponse.json(
        { success: false, error: 'ID, nombre, dirección y ciudad son requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = {
      name,
      description: description || '',
      address,
      cityId,
      priceRange: priceRange || 'MEDIUM',
      isActive: isActive !== false
    }

    // Solo agregar campos opcionales si tienen valor
    if (latitude && latitude !== '' && latitude !== null && latitude !== undefined) {
      const lat = parseFloat(latitude)
      if (!isNaN(lat)) {
        updateData.latitude = lat
      }
    }
    if (longitude && longitude !== '' && longitude !== null && longitude !== undefined) {
      const lng = parseFloat(longitude)
      if (!isNaN(lng)) {
        updateData.longitude = lng
      }
    }
    if (phone && phone.trim() !== '') updateData.phone = phone.trim()
    if (website && website.trim() !== '') updateData.website = website.trim()
    if (imageUrl && imageUrl.trim() !== '') updateData.imageUrl = imageUrl.trim()
    if (imageUrl2 && imageUrl2.trim() !== '') updateData.imageUrl2 = imageUrl2.trim()
    if (imageUrl3 && imageUrl3.trim() !== '') updateData.imageUrl3 = imageUrl3.trim()
    // instagram y email no existen en la BD, los omitimos por ahora

    // Manejar horarios de apertura
    if (openingHours) {
      updateData.openingHours = openingHours
    }

    console.log('Update data to send to Supabase:', JSON.stringify(updateData, null, 2))

    const { data: coffeeShop, error } = await supabase
      .from('CoffeeShop')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al actualizar cafetería',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Manejar características (features) si se proporcionan
    if (selectedFeatures && Array.isArray(selectedFeatures)) {
      // Eliminar características existentes
      await supabase
        .from('CoffeeShopFeature')
        .delete()
        .eq('coffeeShopId', id)

      // Agregar nuevas características
      if (selectedFeatures.length > 0) {
        const featureInserts = selectedFeatures.map(featureId => ({
          coffeeShopId: id,
          featureId: featureId
        }))

        await supabase
          .from('CoffeeShopFeature')
          .insert(featureInserts)
      }
    }

    return NextResponse.json({
      success: true,
      data: coffeeShop
    })
  } catch (error) {
    console.error('Error updating coffee shop:', error)
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