import { NextRequest, NextResponse } from 'next/server'

// Endpoint de debugging para capturar datos del PUT
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('=== DEBUG PUT REQUEST ===')
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    console.log('Body keys:', Object.keys(body))
    console.log('Body:', JSON.stringify(body, null, 2))
    console.log('=== END DEBUG ===')
    
    // Verificar tipos de datos problemáticos
    const issues = []
    
    if (body.latitude !== undefined && body.latitude !== null && body.latitude !== '') {
      const lat = parseFloat(body.latitude)
      if (isNaN(lat)) {
        issues.push(`latitude "${body.latitude}" is not a valid number`)
      }
    }
    
    if (body.longitude !== undefined && body.longitude !== null && body.longitude !== '') {
      const lng = parseFloat(body.longitude)
      if (isNaN(lng)) {
        issues.push(`longitude "${body.longitude}" is not a valid number`)
      }
    }
    
    if (body.openingHours && typeof body.openingHours !== 'object') {
      issues.push(`openingHours is not an object: ${typeof body.openingHours}`)
    }
    
    if (body.selectedFeatures && !Array.isArray(body.selectedFeatures)) {
      issues.push(`selectedFeatures is not an array: ${typeof body.selectedFeatures}`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug data captured',
      issues: issues,
      dataTypes: {
        latitude: typeof body.latitude,
        longitude: typeof body.longitude,
        openingHours: typeof body.openingHours,
        selectedFeatures: typeof body.selectedFeatures,
        images: typeof body.images
      }
    })
  } catch (error) {
    console.error('Debug PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
