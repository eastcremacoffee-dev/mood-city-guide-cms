// Solución temporal para guardar URLs de imágenes en localStorage
// hasta que se agregue la columna imageUrl a la tabla CoffeeShop

const STORAGE_KEY = 'coffee-shop-images'

interface CoffeeShopImage {
  coffeeShopId: string
  imageUrl: string
  uploadedAt: string
}

export function saveImageUrl(coffeeShopId: string, imageUrl: string): void {
  try {
    const existingImages = getStoredImages()
    const updatedImages = existingImages.filter(img => img.coffeeShopId !== coffeeShopId)
    
    updatedImages.push({
      coffeeShopId,
      imageUrl,
      uploadedAt: new Date().toISOString()
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages))
  } catch (error) {
    console.error('Error saving image URL:', error)
  }
}

export function getImageUrl(coffeeShopId: string): string | null {
  try {
    const images = getStoredImages()
    const image = images.find(img => img.coffeeShopId === coffeeShopId)
    return image?.imageUrl || null
  } catch (error) {
    console.error('Error getting image URL:', error)
    return null
  }
}

export function removeImageUrl(coffeeShopId: string): void {
  try {
    const images = getStoredImages()
    const filteredImages = images.filter(img => img.coffeeShopId !== coffeeShopId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredImages))
  } catch (error) {
    console.error('Error removing image URL:', error)
  }
}

function getStoredImages(): CoffeeShopImage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error parsing stored images:', error)
    return []
  }
}

export function getAllStoredImages(): CoffeeShopImage[] {
  return getStoredImages()
}

// Limpiar imágenes antiguas (más de 30 días)
export function cleanOldImages(): void {
  try {
    const images = getStoredImages()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentImages = images.filter(img => {
      const uploadDate = new Date(img.uploadedAt)
      return uploadDate > thirtyDaysAgo
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentImages))
  } catch (error) {
    console.error('Error cleaning old images:', error)
  }
}
