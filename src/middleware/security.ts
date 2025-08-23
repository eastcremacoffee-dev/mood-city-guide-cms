import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// Configuración de rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500, // Máximo 500 IPs únicas por minuto
})

// Lista de IPs bloqueadas (ejemplo)
const blockedIPs = new Set<string>([
  // Agregar IPs maliciosas aquí
])

// Rutas que requieren rate limiting más estricto
const strictRateLimitPaths = [
  '/api/auth',
  '/api/user',
  '/api/admin'
]

// Rutas públicas que no requieren autenticación
// const publicPaths = [ // Removed unused variable
//   '/api/cafeterias',
//   '/api/cities',
//   '/api/features'
// ]

export async function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // 1. Verificar IPs bloqueadas
  if (blockedIPs.has(ip)) {
    console.log(`🚫 Blocked IP attempt: ${ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // 2. Rate limiting
  try {
    const isStrictPath = strictRateLimitPaths.some(path => pathname.startsWith(path))
    const limit = isStrictPath ? 10 : 100 // Límite más estricto para rutas sensibles
    
    await limiter.check(limit, ip)
  } catch {
    console.log(`🚫 Rate limit exceeded for IP: ${ip} on path: ${pathname}`)
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    })
  }
  
  // 3. Validación de headers de seguridad
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.length < 10) {
    console.log(`🚫 Suspicious request without proper user agent from IP: ${ip}`)
    return new NextResponse('Bad Request', { status: 400 })
  }
  
  // 4. Protección CSRF para métodos POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    // const referer = request.headers.get('referer') // Removed unused variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3007']
    
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.log(`🚫 CSRF protection triggered for origin: ${origin} from IP: ${ip}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  // 5. Logging de seguridad
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 Security check passed: ${request.method} ${pathname} from ${ip}`)
  }
  
  return NextResponse.next()
}

// Configuración de paths que requieren el middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*'
  ]
}
