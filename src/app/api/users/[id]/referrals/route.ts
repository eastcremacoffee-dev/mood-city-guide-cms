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
    console.log(`🔍 Obteniendo referidos del usuario ${userId}`)

    // Obtener referidos del usuario
    const { data: referrals, error } = await supabase
      .from('user_referrals')
      .select(`
        id,
        referred_user_id,
        referred_apple_id,
        referral_code,
        status,
        reward_claimed,
        created_at,
        completed_at
      `)
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error obteniendo referidos:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // Obtener información de los usuarios referidos
    const formattedReferrals = await Promise.all(
      (referrals || []).map(async (referral) => {
        let referredUserName = 'Usuario pendiente'
        let referredUserEmail = 'Pendiente de registro'

        if (referral.referred_user_id) {
          const { data: referredUser } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', referral.referred_user_id)
            .single()

          if (referredUser) {
            referredUserName = referredUser.name || 'Usuario sin nombre'
            referredUserEmail = referredUser.email || 'Sin email'
          }
        }

        return {
          id: referral.id.toString(),
          referredUserName,
          referredUserEmail,
          referralCode: referral.referral_code,
          status: referral.status,
          rewardClaimed: referral.reward_claimed,
          createdAt: referral.created_at,
          completedAt: referral.completed_at
        }
      })
    )

    console.log(`✅ ${formattedReferrals.length} referidos obtenidos`)

    return NextResponse.json({
      success: true,
      data: formattedReferrals
    })

  } catch (error) {
    console.error('❌ Error en API de referidos:', error)
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
    console.log(`📝 Creando nuevo referido para usuario ${userId}:`, body)

    const { referralCode, referredUserId, referredAppleId } = body

    // Crear nuevo referido
    const { data, error } = await supabase
      .from('user_referrals')
      .insert({
        referrer_user_id: userId,
        referrer_apple_id: body.referrerAppleId || userId,
        referred_user_id: referredUserId,
        referred_apple_id: referredAppleId,
        referral_code: referralCode,
        status: referredUserId ? 'completed' : 'pending',
        completed_at: referredUserId ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando referido:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // Actualizar contador de referidos del usuario
    await supabase
      .from('users')
      .update({
        total_referrals: supabase.raw('total_referrals + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    console.log(`✅ Referido creado exitosamente`)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Referido creado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST de referidos:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
