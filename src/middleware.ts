import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Solo proteger rutas /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verificar si hay una sesión de admin
    const adminSession = request.cookies.get('admin-session')
    
    console.log('Middleware - Path:', request.nextUrl.pathname)
    console.log('Middleware - Cookie:', adminSession?.value)
    console.log('Middleware - All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`))
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      // Redirigir al login si no hay sesión
      console.log('Redirecting to login - no valid session found')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    console.log('Session valid, allowing access')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
