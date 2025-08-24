import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, validateCloudinaryConfig } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Validar configuración de Cloudinary
    if (!validateCloudinaryConfig()) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary not configured. Please check environment variables.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'mood-city-guide'
    const tags = formData.get('tags') as string || 'coffee-shop'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB para evitar timeouts)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Subir a Cloudinary
    const uploadResult = await uploadImage(file, {
      folder,
      tags: tags.split(',').map(tag => tag.trim()),
      context: {
        uploaded_by: 'mood-city-guide-cms',
        upload_date: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Capturar diferentes tipos de errores
    let errorMessage = 'Upload failed'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Errores específicos de Cloudinary
      if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout - try with a smaller image'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error - check your connection'
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Invalid image format'
      } else if (error.message.includes('size')) {
        errorMessage = 'Image too large'
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID required' },
        { status: 400 }
      )
    }

    // Eliminar de Cloudinary
    const { deleteImage } = await import('@/lib/cloudinary')
    const deleted = await deleteImage(publicId)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    )
  }
}