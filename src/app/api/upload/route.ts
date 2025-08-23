import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'coffee-shops'

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

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Convertir archivo a buffer
    const buffer = await file.arrayBuffer()

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Upload failed', details: uploadError.message },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: fileName,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      )
    }

    // Eliminar de Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from('images')
      .remove([path])

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete image', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    )
  }
}