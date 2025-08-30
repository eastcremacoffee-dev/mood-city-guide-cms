import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Obtener todas las propuestas con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log(`📋 Obteniendo propuestas - Status: ${status}, Ciudad: ${city}, Página: ${page}`)

    let query = supabase
      .from('coffee_shop_proposals')
      .select('*')
      .order('created_at', { ascending: false })

    // Aplicar filtros si se proporcionan
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (city && city !== 'all') {
      query = query.ilike('city', `%${city}%`)
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1)

    const { data: proposals, error, count } = await query

    if (error) {
      console.error('❌ Error obteniendo propuestas:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Obtener el total de registros para la paginación
    const { count: totalCount } = await supabase
      .from('coffee_shop_proposals')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ ${proposals?.length || 0} propuestas obtenidas`)

    return NextResponse.json({
      success: true,
      data: proposals || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('❌ Error en GET /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva propuesta de cafetería
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📝 Creando nueva propuesta:', body.name)

    // Validar campos requeridos
    const requiredFields = ['name', 'address', 'city']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `El campo ${field} es requerido` },
          { status: 400 }
        )
      }
    }

    // Preparar datos para insertar
    const proposalData = {
      name: body.name,
      description: body.description || null,
      address: body.address,
      city: body.city,
      country: body.country || 'Spain',
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      opening_hours: body.opening_hours || null,
      features: body.features || [],
      price_range: body.price_range || '€€',
      submitted_by_user_id: body.submitted_by_user_id || null,
      submitted_by_name: body.submitted_by_name || null,
      submitted_by_email: body.submitted_by_email || null,
      status: 'pending',
      image_urls: body.image_urls || []
    }

    const { data: proposal, error } = await supabase
      .from('coffee_shop_proposals')
      .insert([proposalData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando propuesta:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Propuesta creada exitosamente: ${proposal.id}`)

    return NextResponse.json({
      success: true,
      data: proposal,
      message: 'Propuesta creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en POST /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar múltiples propuestas (para acciones en lote)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, proposalIds, data } = body

    console.log(`🔄 Acción en lote: ${action} para ${proposalIds?.length} propuestas`)

    if (!action || !proposalIds || !Array.isArray(proposalIds)) {
      return NextResponse.json(
        { success: false, error: 'Acción y IDs de propuestas son requeridos' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = { 
          status: 'approved', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: data?.reviewed_by || 'admin'
        }
        break
      case 'reject':
        updateData = { 
          status: 'rejected', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: data?.reviewed_by || 'admin',
          admin_notes: data?.admin_notes || null
        }
        break
      case 'mark_in_review':
        updateData = { 
          status: 'in_review',
          reviewed_by: data?.reviewed_by || 'admin'
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

    const { data: updatedProposals, error } = await supabase
      .from('coffee_shop_proposals')
      .update(updateData)
      .in('id', proposalIds)
      .select()

    if (error) {
      console.error('❌ Error actualizando propuestas:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ ${updatedProposals?.length} propuestas actualizadas`)

    return NextResponse.json({
      success: true,
      data: updatedProposals,
      message: `${updatedProposals?.length} propuestas actualizadas exitosamente`
    })

  } catch (error) {
    console.error('❌ Error en PATCH /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
