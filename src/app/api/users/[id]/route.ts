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
    console.log(`🔍 Obteniendo usuario ${userId} desde Supabase...`)

    // Obtener usuario específico
    const { data: user, error } = await supabase
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
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Error obteniendo usuario:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 404 })
    }

    // Obtener estadísticas del usuario
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.apple_user_id)

    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.apple_user_id)

    // Obtener favoritos del usuario
    const { data: favorites } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        coffee_shops (
          name,
          city
        )
      `)
      .eq('user_id', user.apple_user_id)
      .order('created_at', { ascending: false })

    // Obtener reviews del usuario
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        coffee_shops (
          name
        )
      `)
      .eq('user_id', user.apple_user_id)
      .order('created_at', { ascending: false })

    const userWithDetails = {
      id: user.id.toString(),
      fullName: user.name || 'Usuario Sin Nombre',
      email: user.email || '',
      appleId: user.apple_user_id,
      bio: user.bio,
      location: user.location,
      favoriteType: user.favorite_type,
      profileImageURL: user.profile_image_url,
      createdAt: user.created_at,
      lastLogin: user.updated_at,
      isActive: true,
      reviewsCount: reviewsCount || 0,
      favoritesCount: favoritesCount || 0,
      favorites: (favorites || []).map(fav => ({
        id: fav.id.toString(),
        coffeeShopName: fav.coffee_shops?.name || 'Cafetería desconocida',
        coffeeShopLocation: fav.coffee_shops?.city || 'Ubicación desconocida',
        addedAt: fav.created_at
      })),
      reviews: (reviews || []).map(review => ({
        id: review.id.toString(),
        coffeeShopName: review.coffee_shops?.name || 'Cafetería desconocida',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at
      }))
    }

    console.log(`✅ Usuario ${userId} obtenido exitosamente`)

    return NextResponse.json({
      success: true,
      data: userWithDetails
    })

  } catch (error) {
    console.error('❌ Error en API de usuario individual:', error)
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
    console.log(`📝 Actualizando usuario ${userId}:`, body)

    const { name, email, bio, location, favoriteType, profileImageURL, isActive } = body

    // Actualizar usuario
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
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error actualizando usuario:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ Usuario ${userId} actualizado exitosamente`)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Usuario actualizado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PATCH de usuario:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Eliminando usuario con ID: ${id}`)

    // Eliminar usuario de Supabase
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error eliminando usuario:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Usuario ${id} eliminado exitosamente`)

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
