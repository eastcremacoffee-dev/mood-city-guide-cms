import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'Review received successfully',
      data: {
        id: `review-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        user: {
          id: body.userId || 'unknown',
          name: 'Usuario Anónimo',
          avatar: null
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error processing request'
    }, { status: 500 })
  }
}
