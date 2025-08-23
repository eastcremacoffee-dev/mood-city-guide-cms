import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedUser {
  id: string
  email: string | null
  name: string | null
  firstName: string | null
  lastName: string | null
  role: string
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remover "Bearer "

    // Buscar usuario por token de sesión
    const user = await prisma.user.findFirst({
      where: { sessionToken: token }
    })

    if (!user) {
      return null
    }

    // Verificar que la sesión no sea muy antigua (30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (user.lastLoginAt && user.lastLoginAt < thirtyDaysAgo) {
      return null
    }

    // Actualizar última actividad
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }

  } catch (error) {
    console.error('❌ Error autenticando usuario:', error)
    return null
  }
}

export function createAuthResponse(message: string = 'No autorizado') {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  )
}
