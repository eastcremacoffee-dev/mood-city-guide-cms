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
    console.log(`🔍 Obteniendo notificaciones del usuario ${userId}`)

    // Obtener notificaciones del usuario
    const { data: notifications, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error obteniendo notificaciones:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    const formattedNotifications = (notifications || []).map(notification => ({
      id: notification.id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      priority: notification.priority,
      createdAt: notification.created_at,
      readAt: notification.read_at,
      sentAt: notification.sent_at
    }))

    console.log(`✅ ${formattedNotifications.length} notificaciones obtenidas`)

    return NextResponse.json({
      success: true,
      data: formattedNotifications
    })

  } catch (error) {
    console.error('❌ Error en API de notificaciones:', error)
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
    console.log(`📝 Enviando notificación a usuario ${userId}:`, body)

    const { title, message, type = 'general', priority = 'normal', scheduledFor } = body

    // Crear nueva notificación
    const { data, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        apple_user_id: body.appleUserId || userId,
        title,
        message,
        type,
        priority,
        scheduled_for: scheduledFor,
        sent_at: scheduledFor ? null : new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando notificación:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ Notificación creada exitosamente`)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Notificación enviada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST de notificaciones:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    console.log(`📝 Actualizando notificaciones del usuario ${userId}:`, body)

    const { notificationId, status, readAt } = body

    // Actualizar notificación
    const { data, error } = await supabase
      .from('user_notifications')
      .update({
        status,
        read_at: readAt || (status === 'read' ? new Date().toISOString() : null),
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error actualizando notificación:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ Notificación actualizada exitosamente`)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Notificación actualizada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PATCH de notificaciones:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
