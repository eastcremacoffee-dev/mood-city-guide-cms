import { v2 as cloudinary } from 'cloudinary'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
}

export interface UploadOptions {
  folder?: string
  transformation?: Record<string, unknown>[]
  tags?: string[]
  context?: Record<string, string>
}

/**
 * Subir imagen a Cloudinary
 */
export async function uploadImage(
  file: File | string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || 'mood-city-guide',
      tags: options.tags || ['coffee-shop'],
      context: options.context,
      transformation: options.transformation || [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }

    let uploadResult: { secure_url: string; public_id: string; width?: number; height?: number; format?: string; resource_type?: string; created_at?: string }

    if (typeof file === 'string') {
      // Upload from URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions)
    } else {
      // Upload from File object
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataURI = `data:${file.type};base64,${base64}`
      
      uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions)
    }

    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      width: uploadResult.width || 0,
      height: uploadResult.height || 0,
      format: uploadResult.format || '',
      resource_type: uploadResult.resource_type || '',
      created_at: uploadResult.created_at || ''
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Eliminar imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

/**
 * Generar URL optimizada
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
): string {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  })
}

/**
 * Generar múltiples tamaños de imagen
 */
export function getResponsiveImageUrls(publicId: string) {
  const sizes = [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'small', width: 400, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1200, height: 900 }
  ]

  return sizes.reduce((urls, size) => {
    urls[size.name] = getOptimizedImageUrl(publicId, {
      width: size.width,
      height: size.height
    })
    return urls
  }, {} as Record<string, string>)
}

/**
 * Validar configuración de Cloudinary
 */
export function validateCloudinaryConfig(): boolean {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing Cloudinary configuration: ${key}`)
      return false
    }
  }
  
  return true
}

export default cloudinary