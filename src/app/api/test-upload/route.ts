import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST UPLOAD START ===')
    
    // Log headers
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Log content type
    const contentType = request.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    // Try to get form data
    const formData = await request.formData()
    console.log('FormData entries:')
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - name: ${value.name}, size: ${value.size}, type: ${value.type}`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
    
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file found in form data')
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        debug: {
          formDataKeys: Array.from(formData.keys()),
          contentType
        }
      }, { status: 400 })
    }
    
    // Basic file info
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
    
    console.log('File info:', fileInfo)
    
    // Try to read a small portion of the file
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer.slice(0, 100))
    
    console.log('First 10 bytes:', Array.from(uint8Array.slice(0, 10)))
    console.log('=== TEST UPLOAD END ===')
    
    return NextResponse.json({
      success: true,
      message: 'File received successfully',
      fileInfo,
      debug: {
        bufferSize: buffer.byteLength,
        firstBytes: Array.from(uint8Array.slice(0, 10))
      }
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test upload endpoint is working',
    timestamp: new Date().toISOString()
  })
}
