import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ohhzkddjytbwyuxamyaf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHprZGRqeXRid3l1eGFteWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjYzMDMsImV4cCI6MjA3MTEwMjMwM30.fKhdpttsn7cvqNW1UUiNgU1uKz5WyAYHadJTmwJaXa0'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Obteniendo usuarios desde Supabase...')

    // Obtener usuarios de la tabla users
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        apple_user_id,
        name,
        email,
        bio,
        location,
        favorite_type,
        profile_image_url,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // Obtener estadísticas para cada usuario
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Obtener conteo de favoritos
        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.apple_user_id)

        // Obtener conteo de reviews
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.apple_user_id)

        return {
          id: user.id.toString(),
          fullName: user.name || 'Usuario Sin Nombre',
          email: user.email || '',
          appleId: user.apple_user_id,
          bio: user.bio,
          location: user.location,
          favoriteType: user.favorite_type,
          profileImageURL: user.profile_image_url,
          createdAt: user.created_at,
          lastLogin: user.updated_at, // Usando updated_at como proxy para last login
          isActive: true, // Por defecto activo, se puede agregar campo en BD
          reviewsCount: reviewsCount || 0,
          favoritesCount: favoritesCount || 0
        }
      })
    )

    console.log(`✅ ${usersWithStats.length} usuarios obtenidos exitosamente`)

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      total: usersWithStats.length
    })

  } catch (error) {
    console.error('❌ Error en API de usuarios:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Creando/actualizando usuario:', body)

    const { appleUserId, name, email, bio, location, favoriteType, profileImageURL } = body

    if (!appleUserId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Apple User ID y email son requeridos' 
      }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('apple_user_id', appleUserId)
      .single()

    let result

    if (existingUser) {
      // Actualizar usuario existente
      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          email,
          bio,
          location,
          favorite_type: favoriteType,
          profile_image_url: profileImageURL,
          updated_at: new Date().toISOString()
        })
        .eq('apple_user_id', appleUserId)
        .select()
        .single()

      result = { data, error }
      console.log('✅ Usuario actualizado')
    } else {
      // Crear nuevo usuario con ID único
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: uniqueId,
          apple_user_id: appleUserId,
          name,
          email,
          bio,
          location,
          favorite_type: favoriteType,
          profile_image_url: profileImageURL,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      result = { data, error }
      console.log('✅ Usuario creado con ID:', uniqueId)
    }

    if (result.error) {
      console.error('❌ Error guardando usuario:', result.error)
      return NextResponse.json({ 
        success: false, 
        error: result.error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: existingUser ? 'Usuario actualizado' : 'Usuario creado'
    })

  } catch (error) {
    console.error('❌ Error en POST de usuarios:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
