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

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
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
    return NextResponse.json(
      { success: false, error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
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