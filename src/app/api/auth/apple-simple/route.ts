import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST - Autenticación con Apple Sign In
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appleUserId, email, firstName, lastName } = body

    console.log('🍎 Apple Auth Request:', { appleUserId, email, firstName, lastName })

    if (!appleUserId) {
      return NextResponse.json(
        { success: false, error: 'Apple User ID es requerido' },
        { status: 400 }
      )
    }

    // Generar token de sesión
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Buscar usuario existente por Apple ID
    let user = await prisma.user.findUnique({
      where: { appleUserId }
    })

    if (user) {
      // Usuario existente - actualizar sesión
      user = await prisma.user.update({
        where: { appleUserId },
        data: {
          sessionToken,
          lastLoginAt: new Date(),
          // Actualizar datos si vienen nuevos
          ...(email && { email }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(firstName || lastName ? { 
            name: `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim() 
          } : {})
        }
      })

      console.log('✅ Usuario existente actualizado:', user.id)
    } else {
      // Nuevo usuario - crear
      const fullName = `${firstName || ''} ${lastName || ''}`.trim()
      
      user = await prisma.user.create({
        data: {
          appleUserId,
          email: email || null,
          firstName: firstName || null,
          lastName: lastName || null,
          name: fullName || null,
          sessionToken,
          lastLoginAt: new Date(),
          role: 'USER'
        }
      })

      console.log('✅ Nuevo usuario creado:', user.id)
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        sessionToken
      }
    })

  } catch (error) {
    console.error('❌ Error en Apple Auth:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Validar sesión existente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por token de sesión
    const user = await prisma.user.findFirst({
      where: { sessionToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      )
    }

    // Verificar que la sesión no sea muy antigua (opcional - 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (user.lastLoginAt && user.lastLoginAt < thirtyDaysAgo) {
      return NextResponse.json(
        { success: false, error: 'Sesión expirada' },
        { status: 401 }
      )
    }

    // Actualizar última actividad
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('❌ Error validando sesión:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cerrar sesión
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    // Limpiar token de sesión
    await prisma.user.updateMany({
      where: { sessionToken: token },
      data: { sessionToken: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error cerrando sesión:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
