import { NextRequest, NextResponse } from 'next/server'

// Credenciales de admin (en producción deberían estar en variables de entorno)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'MoodCity2024!'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt:', { username, password: password ? '***' : 'empty' })
    console.log('Expected:', { username: ADMIN_CREDENTIALS.username, password: ADMIN_CREDENTIALS.password ? '***' : 'empty' })

    // Verificar credenciales
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log('Credentials match - setting cookie')
      
      // Crear respuesta con cookie de sesión
      const response = NextResponse.json({ success: true })
      
      // Establecer cookie de sesión (válida por 24 horas)
      response.cookies.set('admin-session', 'authenticated', {
        httpOnly: true,
        secure: true, // Siempre true para Vercel
        sameSite: 'none', // Necesario para cookies cross-site en Vercel
        maxAge: 24 * 60 * 60, // 24 horas
        path: '/' // Asegurar que la cookie esté disponible en toda la app
      })

      return response
    } else {
      console.log('Credentials do not match')
      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.log('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout - eliminar cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin-session')
  return response
}
