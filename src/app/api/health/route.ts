import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`
    
    const dbResponseTime = Date.now() - startTime
    
    // Información del sistema
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      services: {
        prisma: 'operational',
        nextjs: 'operational'
      }
    }
    
    return NextResponse.json(healthInfo, { status: 200 })
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    const errorInfo = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      services: {
        prisma: 'error',
        nextjs: 'operational'
      }
    }
    
    return NextResponse.json(errorInfo, { status: 503 })
  }
}
