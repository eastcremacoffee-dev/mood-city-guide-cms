import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
          imageUrl: city.imageUrl,
          country: city.country,
          coffeeShopsCount: count || 0,
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
    const { name, description, imageUrl, country } = body

    // Validar datos requeridos
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      )
    }

    // Crear ID único basado en el nombre (slug)
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data: city, error } = await supabase
      .from('City')
      .insert([
        {
          id,
          name,
          description,
          imageUrl: imageUrl || null,
          country: country || 'España'
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