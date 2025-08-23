import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener todas las features predefinidas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    let query = supabase
      .from('FeatureTemplate')
      .select('*')
      .order('name', { ascending: true })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isActive !== null) {
      query = query.eq('isActive', isActive === 'true')
    }

    const { data: features, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching features',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: features || [],
      count: features?.length || 0
    })
  } catch (error) {
    console.error('Error in features API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching features',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Crear nueva feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, icon } = body

    // Validar datos requeridos
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Nombre y categoría son requeridos' },
        { status: 400 }
      )
    }

    // Crear ID único basado en el nombre
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const { data: feature, error } = await supabase
      .from('FeatureTemplate')
      .insert([
        {
          id,
          name,
          description: description || '',
          category,
          icon: icon || null,
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
          error: 'Error creating feature',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feature
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating feature:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating feature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}