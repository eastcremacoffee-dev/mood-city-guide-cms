import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Simple test endpoint called')
    
    return NextResponse.json({
      success: true,
      message: 'Simple endpoint working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Simple POST test called')
    
    const body = await request.json()
    console.log('Body received:', body)
    
    return NextResponse.json({
      success: true,
      message: 'POST working',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
