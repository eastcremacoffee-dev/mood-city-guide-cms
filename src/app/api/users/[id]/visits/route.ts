import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ohhzkddjytbwyuxamyaf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHprZGRqeXRid3l1eGFteWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjYzMDMsImV4cCI6MjA3MTEwMjMwM30.fKhdpttsn7cvqNW1UUiNgU1uKz5WyAYHadJTmwJaXa0'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    console.log(`🔍 Obteniendo visitas del usuario ${userId}`)

    // Obtener visitas del usuario
    const { data: visits, error } = await supabase
      .from('user_visits')
      .select(`
        id,
        visit_date,
        duration_minutes,
        rating,
        notes,
        coffee_shops (
          name,
          city
        )
      `)
      .eq('user_id', userId)
      .order('visit_date', { ascending: false })

    if (error) {
      console.error('❌ Error obteniendo visitas:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    const formattedVisits = (visits || []).map(visit => ({
      id: visit.id.toString(),
      coffeeShopName: visit.coffee_shops?.name || 'Cafetería desconocida',
      visitDate: visit.visit_date,
      durationMinutes: visit.duration_minutes || 0,
      rating: visit.rating || 0,
      notes: visit.notes || ''
    }))

    console.log(`✅ ${formattedVisits.length} visitas obtenidas`)

    return NextResponse.json({
      success: true,
      data: formattedVisits
    })

  } catch (error) {
    console.error('❌ Error en API de visitas:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    console.log(`📝 Creando nueva visita para usuario ${userId}:`, body)

    const { coffeeShopId, visitDate, durationMinutes, rating, notes } = body

    // Crear nueva visita
    const { data, error } = await supabase
      .from('user_visits')
      .insert({
        user_id: userId,
        apple_user_id: body.appleUserId || userId,
        coffee_shop_id: coffeeShopId,
        visit_date: visitDate || new Date().toISOString(),
        duration_minutes: durationMinutes,
        rating,
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando visita:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ Visita creada exitosamente`)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Visita creada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST de visitas:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
