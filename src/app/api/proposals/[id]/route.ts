import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Obtener una propuesta específica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de propuesta requerido' },
        { status: 400 }
      )
    }

    console.log(`📋 Obteniendo propuesta con ID: ${id}`)

    const { data: proposal, error } = await supabase
      .from('coffee_shop_proposals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Propuesta no encontrada' },
          { status: 404 }
        )
      }
      console.error('❌ Error obteniendo propuesta:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Propuesta ${id} obtenida exitosamente`)

    return NextResponse.json({
      success: true,
      data: proposal
    })

  } catch (error) {
    console.error('❌ Error en GET /api/proposals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar una propuesta específica
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de propuesta requerido' },
        { status: 400 }
      )
    }

    console.log(`🔄 Actualizando propuesta ${id}`)

    // Preparar datos para actualizar (solo campos permitidos)
    const allowedFields = [
      'name', 'description', 'address', 'city', 'country',
      'latitude', 'longitude', 'phone', 'email', 'website',
      'instagram', 'facebook', 'opening_hours', 'features',
      'price_range', 'status', 'admin_notes', 'reviewed_by',
      'image_urls'
    ]

    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Si se está cambiando el estado, añadir timestamp de revisión
    if (body.status && ['approved', 'rejected', 'in_review'].includes(body.status)) {
      updateData.reviewed_at = new Date().toISOString()
      if (!updateData.reviewed_by) {
        updateData.reviewed_by = 'admin'
      }
    }

    const { data: proposal, error } = await supabase
      .from('coffee_shop_proposals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Propuesta no encontrada' },
          { status: 404 }
        )
      }
      console.error('❌ Error actualizando propuesta:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Propuesta ${id} actualizada exitosamente`)

    return NextResponse.json({
      success: true,
      data: proposal,
      message: 'Propuesta actualizada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PATCH /api/proposals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una propuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de propuesta requerido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Eliminando propuesta con ID: ${id}`)

    const { error } = await supabase
      .from('coffee_shop_proposals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error eliminando propuesta:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Propuesta ${id} eliminada exitosamente`)

    return NextResponse.json({
      success: true,
      message: 'Propuesta eliminada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en DELETE /api/proposals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Convertir propuesta a cafetería oficial
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de propuesta requerido' },
        { status: 400 }
      )
    }

    console.log(`🏪 Convirtiendo propuesta ${id} a cafetería oficial`)

    // Obtener la propuesta
    const { data: proposal, error: getError } = await supabase
      .from('coffee_shop_proposals')
      .select('*')
      .eq('id', id)
      .single()

    if (getError || !proposal) {
      return NextResponse.json(
        { success: false, error: 'Propuesta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la propuesta esté aprobada
    if (proposal.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden convertir propuestas aprobadas' },
        { status: 400 }
      )
    }

    // Crear la cafetería oficial
    const coffeeShopData = {
      name: proposal.name,
      description: proposal.description,
      address: proposal.address,
      latitude: proposal.latitude,
      longitude: proposal.longitude,
      phone: proposal.phone,
      email: proposal.email,
      website: proposal.website,
      instagram: proposal.instagram,
      facebook: proposal.facebook,
      opening_hours: proposal.opening_hours,
      price_range: proposal.price_range,
      image_urls: proposal.image_urls || [],
      city_id: null, // Se puede asignar después manualmente
      is_active: true,
      created_at: new Date().toISOString()
    }

    const { data: coffeeShop, error: createError } = await supabase
      .from('coffee_shops')
      .insert([coffeeShopData])
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creando cafetería:', createError)
      return NextResponse.json(
        { success: false, error: 'Error creando cafetería oficial' },
        { status: 500 }
      )
    }

    // Actualizar el estado de la propuesta
    await supabase
      .from('coffee_shop_proposals')
      .update({ 
        status: 'converted_to_official',
        admin_notes: `Convertida a cafetería oficial con ID: ${coffeeShop.id}`
      })
      .eq('id', id)

    console.log(`✅ Propuesta ${id} convertida a cafetería oficial ${coffeeShop.id}`)

    return NextResponse.json({
      success: true,
      data: {
        proposal: proposal,
        coffeeShop: coffeeShop
      },
      message: 'Propuesta convertida a cafetería oficial exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST /api/proposals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
