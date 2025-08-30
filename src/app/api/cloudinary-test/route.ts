import { NextResponse } from 'next/server'
import { validateCloudinaryConfig } from '@/lib/cloudinary'

export async function GET() {
  try {
    const isConfigured = validateCloudinaryConfig()
    
    return NextResponse.json({
      success: true,
      data: {
        configured: isConfigured,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error checking Cloudinary configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

